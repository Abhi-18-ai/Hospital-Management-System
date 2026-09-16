'use strict';

const LabOrder = require('./labOrder.model');
const Patient = require('../patients/patient.model');
const Doctor = require('../doctors/doctor.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const notificationService = require('../notifications/notification.service');
const emailService = require('../notifications/email.service');
const {
  AUDIT_ACTIONS,
  LAB_ORDER_STATUS,
  LAB_RESULT_STATUS,
  NOTIFICATION_TYPE,
} = require('../../utils/constants');

async function createLabOrder(payload, req) {
  const [patient, doctor] = await Promise.all([
    Patient.findById(payload.patientId),
    Doctor.findById(payload.doctorId),
  ]);

  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');

  const order = await LabOrder.create(payload);

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.LAB_ORDER_CREATE,
    resourceType: 'LabOrder',
    resourceId: order._id,
  });

  return order;
}

async function listLabOrders(filters, { page, limit, skip }, req) {
  const query = {};
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.doctorId) query.doctorId = filters.doctorId;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (req?.user?.role === 'patient') {
    const ownPatient = await Patient.findOne({ userId: req.user.id }).select('_id');
    query.patientId = ownPatient?._id || null;
  }

  const [items, total] = await Promise.all([
    LabOrder.find(query)
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName mrn')
      .populate('doctorId', 'firstName lastName specialization'),
    LabOrder.countDocuments(query),
  ]);

  return { items, total };
}

async function getLabOrderById(id, req) {
  const order = await LabOrder.findById(id)
    .populate('patientId', 'firstName lastName mrn userId')
    .populate('doctorId', 'firstName lastName specialization');
  if (!order) throw ApiError.notFound('Lab order not found.', 'LAB_ORDER_NOT_FOUND');
  if (req?.user?.role === 'patient' && order.patientId?.userId?.toString() !== req.user.id) {
    throw ApiError.forbidden('You are not permitted to access this lab order.', 'RESOURCE_ACCESS_DENIED');
  }
  return order;
}

const VALID_TRANSITIONS = {
  [LAB_ORDER_STATUS.ORDERED]: [LAB_ORDER_STATUS.SAMPLE_COLLECTED, LAB_ORDER_STATUS.CANCELLED],
  [LAB_ORDER_STATUS.SAMPLE_COLLECTED]: [LAB_ORDER_STATUS.IN_PROGRESS, LAB_ORDER_STATUS.CANCELLED],
  [LAB_ORDER_STATUS.IN_PROGRESS]: [LAB_ORDER_STATUS.RESULT_SUBMITTED, LAB_ORDER_STATUS.CANCELLED],
  [LAB_ORDER_STATUS.RESULT_SUBMITTED]: [LAB_ORDER_STATUS.VERIFIED],
  [LAB_ORDER_STATUS.VERIFIED]: [],
  [LAB_ORDER_STATUS.CANCELLED]: [],
};

async function updateLabOrderStatus(id, newStatus, req) {
  const order = await LabOrder.findById(id);
  if (!order) throw ApiError.notFound('Lab order not found.', 'LAB_ORDER_NOT_FOUND');

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw ApiError.conflict(
      `Cannot transition lab order from '${order.status}' to '${newStatus}'.`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  order.status = newStatus;
  await order.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.LAB_ORDER_STATUS_UPDATE,
    resourceType: 'LabOrder',
    resourceId: order._id,
    metadata: { status: newStatus },
  });

  return order;
}

async function submitResults(id, results, req) {
  const order = await LabOrder.findById(id).populate('patientId', 'userId');
  if (!order) throw ApiError.notFound('Lab order not found.', 'LAB_ORDER_NOT_FOUND');

  if (![LAB_ORDER_STATUS.SAMPLE_COLLECTED, LAB_ORDER_STATUS.IN_PROGRESS].includes(order.status)) {
    throw ApiError.conflict(
      `Cannot submit results for a lab order with status '${order.status}'.`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  order.results.push(
    ...results.map((r) => ({
      ...r,
      status: LAB_RESULT_STATUS.SUBMITTED,
      submittedBy: req.user.id,
      submittedAt: new Date(),
    }))
  );
  order.status = LAB_ORDER_STATUS.RESULT_SUBMITTED;
  await order.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.LAB_RESULT_SUBMIT,
    resourceType: 'LabOrder',
    resourceId: order._id,
    metadata: { testsSubmitted: results.map((r) => r.testName) },
  });

  return order;
}

async function verifyResult(resultId, decision, comment, req) {
  const order = await LabOrder.findOne({ 'results._id': resultId }).populate(
    'patientId',
    'userId firstName lastName contact.email'
  );
  if (!order) throw ApiError.notFound('Lab result not found.', 'LAB_RESULT_NOT_FOUND');

  const result = order.results.id(resultId);
  if (result.status !== LAB_RESULT_STATUS.SUBMITTED) {
    throw ApiError.conflict(`Result with status '${result.status}' cannot be verified.`, 'INVALID_STATUS_TRANSITION');
  }

  result.status = decision === 'verify' ? LAB_RESULT_STATUS.VERIFIED : LAB_RESULT_STATUS.REJECTED;
  result.verifiedBy = req.user.id;
  result.verifiedAt = new Date();
  if (comment) result.interpretation = `${result.interpretation ? result.interpretation + ' | ' : ''}${comment}`;

  const allDecided = order.results.every((r) =>
    [LAB_RESULT_STATUS.VERIFIED, LAB_RESULT_STATUS.REJECTED].includes(r.status)
  );
  if (allDecided && decision === 'verify') {
    order.status = LAB_ORDER_STATUS.VERIFIED;
  }

  await order.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.LAB_RESULT_VERIFY,
    resourceType: 'LabOrder',
    resourceId: order._id,
    metadata: { resultId, decision },
  });

  if (decision === 'verify' && order.patientId?.userId) {
    await notificationService.notify({
      userId: order.patientId.userId,
      type: NOTIFICATION_TYPE.LAB_RESULT_READY,
      title: 'Lab result available',
      message: `Your result for "${result.testName}" is now available.`,
      metadata: { labOrderId: order._id, resultId },
    });
  }

  if (decision === 'verify' && order.patientId?.contact?.email) {
    emailService.sendTemplate(order.patientId.contact.email, 'labResultReady', {
      name: `${order.patientId.firstName} ${order.patientId.lastName}`,
      testName: result.testName,
    });
  }

  return order;
}

module.exports = {
  createLabOrder,
  listLabOrders,
  getLabOrderById,
  updateLabOrderStatus,
  submitResults,
  verifyResult,
};
