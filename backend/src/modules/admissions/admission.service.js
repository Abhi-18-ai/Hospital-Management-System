'use strict';

const Admission = require('./admission.model');
const Patient = require('../patients/patient.model');
const Doctor = require('../doctors/doctor.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const notificationService = require('../notifications/notification.service');
const emailService = require('../notifications/email.service');
const { HOSPITAL_LAYOUT } = require('../../config/hospitalLayout');
const { AUDIT_ACTIONS, ADMISSION_STATUS, NOTIFICATION_TYPE } = require('../../utils/constants');

async function admitPatient(payload, req) {
  const [patient, doctor] = await Promise.all([
    Patient.findById(payload.patientId),
    Doctor.findById(payload.doctorId),
  ]);

  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');

  const activeAdmission = await Admission.findOne({ patientId: payload.patientId, status: ADMISSION_STATUS.ADMITTED });
  if (activeAdmission) {
    throw ApiError.conflict('This patient already has an active admission.', 'PATIENT_ALREADY_ADMITTED');
  }

  const bedOccupied = await Admission.findOne({
    ward: payload.ward,
    room: payload.room,
    bed: payload.bed,
    status: ADMISSION_STATUS.ADMITTED,
  });
  if (bedOccupied) {
    throw ApiError.conflict('The specified bed is already occupied.', 'BED_OCCUPIED');
  }

  let admission;
  try {
    admission = await Admission.create(payload);
  } catch (err) {
    if (err.code === 11000) {
      throw ApiError.conflict('The specified bed is already occupied.', 'BED_OCCUPIED');
    }
    throw err;
  }

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.ADMISSION_CREATE,
    resourceType: 'Admission',
    resourceId: admission._id,
  });

  if (patient.userId) {
    await notificationService.notify({
      userId: patient.userId,
      type: NOTIFICATION_TYPE.ADMISSION_UPDATE,
      title: 'Admission recorded',
      message: `You have been admitted to ${payload.ward}, room ${payload.room}, bed ${payload.bed}.`,
      metadata: { admissionId: admission._id },
    });
  }

  if (patient.contact?.email) {
    emailService.sendTemplate(patient.contact.email, 'admissionUpdate', {
      name: `${patient.firstName} ${patient.lastName}`,
      statusLabel: 'Admitted',
      details: `You have been admitted to ${payload.ward}, room ${payload.room}, bed ${payload.bed}, under the care of Dr. ${doctor.firstName} ${doctor.lastName}.`,
    });
  }

  return admission;
}

async function listAdmissions(filters, { page, limit, skip }, req) {
  const query = {};
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.status) query.status = filters.status;
  if (filters.ward) query.ward = filters.ward;
  if (req?.user?.role === 'patient') {
    const ownPatient = await Patient.findOne({ userId: req.user.id }).select('_id');
    query.patientId = ownPatient?._id || null;
  }

  const [items, total] = await Promise.all([
    Admission.find(query)
      .sort({ admittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName mrn')
      .populate('doctorId', 'firstName lastName specialization'),
    Admission.countDocuments(query),
  ]);

  return { items, total };
}

async function getAdmissionById(id, req) {
  const admission = await Admission.findById(id)
    .populate('patientId', 'firstName lastName mrn userId')
    .populate('doctorId', 'firstName lastName specialization');
  if (!admission) throw ApiError.notFound('Admission not found.', 'ADMISSION_NOT_FOUND');
  if (req?.user?.role === 'patient' && admission.patientId?.userId?.toString() !== req.user.id) {
    throw ApiError.forbidden('You are not permitted to access this admission.', 'RESOURCE_ACCESS_DENIED');
  }
  return admission;
}

async function transferAdmission(id, { ward, room, bed }, req) {
  const admission = await Admission.findById(id);
  if (!admission) throw ApiError.notFound('Admission not found.', 'ADMISSION_NOT_FOUND');

  if (admission.status !== ADMISSION_STATUS.ADMITTED) {
    throw ApiError.conflict('Only an active admission can be transferred.', 'ADMISSION_NOT_ACTIVE');
  }

  const bedOccupied = await Admission.findOne({
    _id: { $ne: admission._id },
    ward,
    room,
    bed,
    status: ADMISSION_STATUS.ADMITTED,
  });
  if (bedOccupied) {
    throw ApiError.conflict('The specified bed is already occupied.', 'BED_OCCUPIED');
  }

  // Record the prior bed in transfer history, then move the admission to the
  // new bed. The admission stays in the ADMITTED status since the patient
  // remains actively admitted -- only their physical location has changed.
  admission.transferHistory.push({ ward: admission.ward, room: admission.room, bed: admission.bed });
  admission.ward = ward;
  admission.room = room;
  admission.bed = bed;

  try {
    await admission.save();
  } catch (err) {
    if (err.code === 11000) {
      throw ApiError.conflict('The specified bed is already occupied.', 'BED_OCCUPIED');
    }
    throw err;
  }

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.ADMISSION_TRANSFER,
    resourceType: 'Admission',
    resourceId: admission._id,
    metadata: { ward, room, bed },
  });

  return admission;
}

async function dischargePatient(id, dischargeSummary, req) {
  const admission = await Admission.findById(id).populate('patientId', 'userId firstName lastName contact.email');
  if (!admission) throw ApiError.notFound('Admission not found.', 'ADMISSION_NOT_FOUND');

  if (admission.status !== ADMISSION_STATUS.ADMITTED) {
    throw ApiError.conflict('This admission has already been discharged.', 'ALREADY_DISCHARGED');
  }

  admission.status = ADMISSION_STATUS.DISCHARGED;
  admission.dischargedAt = new Date();
  admission.dischargeSummary = dischargeSummary || null;
  await admission.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.ADMISSION_DISCHARGE,
    resourceType: 'Admission',
    resourceId: admission._id,
  });

  if (admission.patientId?.userId) {
    await notificationService.notify({
      userId: admission.patientId.userId,
      type: NOTIFICATION_TYPE.ADMISSION_UPDATE,
      title: 'Discharged',
      message: 'You have been discharged. Please follow up as instructed by your care team.',
      metadata: { admissionId: admission._id },
    });
  }

  if (admission.patientId?.contact?.email) {
    emailService.sendTemplate(admission.patientId.contact.email, 'admissionUpdate', {
      name: `${admission.patientId.firstName} ${admission.patientId.lastName}`,
      statusLabel: 'Discharged',
      details:
        'You have been discharged. Please follow up as instructed by your care team.' +
        (dischargeSummary ? ` Discharge summary: ${dischargeSummary}` : ''),
    });
  }

  return admission;
}

async function getBedsAvailability(wardFilter) {
  const occupied = await Admission.find({ status: ADMISSION_STATUS.ADMITTED }).select('ward room bed');
  const occupiedSet = new Set(occupied.map((a) => `${a.ward}|${a.room}|${a.bed}`));

  const layout = wardFilter ? HOSPITAL_LAYOUT.filter((w) => w.ward === wardFilter) : HOSPITAL_LAYOUT;

  return layout.map((wardEntry) => {
    const rooms = wardEntry.rooms.map((roomEntry) => {
      const beds = roomEntry.beds.map((bed) => ({
        bed,
        occupied: occupiedSet.has(`${wardEntry.ward}|${roomEntry.room}|${bed}`),
      }));
      return {
        room: roomEntry.room,
        totalBeds: beds.length,
        availableBeds: beds.filter((b) => !b.occupied).length,
        beds,
      };
    });

    return {
      ward: wardEntry.ward,
      totalBeds: rooms.reduce((sum, r) => sum + r.totalBeds, 0),
      availableBeds: rooms.reduce((sum, r) => sum + r.availableBeds, 0),
      rooms,
    };
  });
}

module.exports = {
  admitPatient,
  listAdmissions,
  getAdmissionById,
  transferAdmission,
  dischargePatient,
  getBedsAvailability,
};
