'use strict';

const Appointment = require('./appointment.model');
const Patient = require('../patients/patient.model');
const Doctor = require('../doctors/doctor.model');
const Department = require('../departments/department.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const notificationService = require('../notifications/notification.service');
const emailService = require('../notifications/email.service');
const { AUDIT_ACTIONS, APPOINTMENT_STATUS, NOTIFICATION_TYPE, ROLES } = require('../../utils/constants');

const ACTIVE_STATUSES = [
  APPOINTMENT_STATUS.SCHEDULED,
  APPOINTMENT_STATUS.CHECKED_IN,
  APPOINTMENT_STATUS.IN_PROGRESS,
];

function formatDateTimeForEmail(date) {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

async function assertNoConflict(doctorId, startAt, endAt, excludeAppointmentId = null) {
  const query = {
    doctorId,
    status: { $in: ACTIVE_STATUSES },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };
  if (excludeAppointmentId) query._id = { $ne: excludeAppointmentId };

  const conflict = await Appointment.findOne(query);
  if (conflict) {
    throw ApiError.conflict('Doctor already has an appointment overlapping this time slot.', 'APPOINTMENT_CONFLICT');
  }
}

async function bookAppointment(payload, req) {
  let patientId = payload.patientId;
  if (req.user.role === ROLES.PATIENT) {
    const ownPatient = await Patient.findOne({ userId: req.user.id }).select('_id');
    if (!ownPatient) throw ApiError.notFound('Patient profile not found.', 'PATIENT_PROFILE_NOT_FOUND');
    patientId = ownPatient._id;
  }
  if (!patientId) throw ApiError.badRequest('Patient is required.', 'PATIENT_REQUIRED');

  const [patient, doctor, department] = await Promise.all([
    Patient.findById(patientId),
    Doctor.findById(payload.doctorId),
    Department.findById(payload.departmentId),
  ]);

  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');
  if (doctor.departmentId.toString() !== payload.departmentId) {
    throw ApiError.badRequest('Doctor does not belong to the specified department.', 'DEPARTMENT_MISMATCH');
  }

  await assertNoConflict(payload.doctorId, new Date(payload.startAt), new Date(payload.endAt));

  const appointment = await Appointment.create({ ...payload, patientId, createdBy: req.user.id });

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
    resourceType: 'Appointment',
    resourceId: appointment._id,
  });

  if (patient.userId) {
    await notificationService.notify({
      userId: patient.userId,
      type: NOTIFICATION_TYPE.APPOINTMENT_CONFIRMATION,
      title: 'Appointment confirmed',
      message: `Your appointment is scheduled for ${appointment.startAt.toISOString()}.`,
      metadata: { appointmentId: appointment._id },
    });
  }

  // Sent by patient contact email regardless of whether they have a portal
  // account -- a walk-in patient registered by a receptionist still wants a
  // confirmation email even if they never log in to the app.
  if (patient.contact?.email) {
    emailService.sendTemplate(patient.contact.email, 'appointmentConfirmation', {
      name: `${patient.firstName} ${patient.lastName}`,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      departmentName: department?.name || 'General',
      startAt: formatDateTimeForEmail(appointment.startAt),
    });
  }

  return appointment;
}

async function listAppointments(filters, { page, limit, skip }, req) {
  const query = {};
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.doctorId) query.doctorId = filters.doctorId;
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.status) query.status = filters.status;
  if (filters.from || filters.to) {
    query.startAt = {};
    if (filters.from) query.startAt.$gte = new Date(filters.from);
    if (filters.to) query.startAt.$lte = new Date(filters.to);
  }

  if (req?.user?.role === ROLES.PATIENT) {
    const ownPatient = await Patient.findOne({ userId: req.user.id }).select('_id');
    query.patientId = ownPatient?._id || null;
  }

  const [items, total] = await Promise.all([
    Appointment.find(query)
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName mrn')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('departmentId', 'name'),
    Appointment.countDocuments(query),
  ]);

  return { items, total };
}

async function getAppointmentById(id, req) {
  const appointment = await Appointment.findById(id)
    .populate('patientId', 'firstName lastName mrn userId')
    .populate('doctorId', 'firstName lastName specialization')
    .populate('departmentId', 'name');
  if (!appointment) throw ApiError.notFound('Appointment not found.', 'APPOINTMENT_NOT_FOUND');
  if (req?.user?.role === ROLES.PATIENT && appointment.patientId?.userId?.toString() !== req.user.id) {
    throw ApiError.forbidden('You are not permitted to access this appointment.', 'RESOURCE_ACCESS_DENIED');
  }
  return appointment;
}

function assertMutable(appointment) {
  if (!ACTIVE_STATUSES.includes(appointment.status)) {
    throw ApiError.conflict(
      `Appointment with status '${appointment.status}' can no longer be modified.`,
      'APPOINTMENT_NOT_MUTABLE'
    );
  }
}

async function updateAppointment(id, updates, req) {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw ApiError.notFound('Appointment not found.', 'APPOINTMENT_NOT_FOUND');

  if (updates.startAt || updates.endAt) {
    assertMutable(appointment);
    const newStart = updates.startAt ? new Date(updates.startAt) : appointment.startAt;
    const newEnd = updates.endAt ? new Date(updates.endAt) : appointment.endAt;
    if (newEnd <= newStart) throw ApiError.badRequest('endAt must be after startAt.', 'INVALID_TIME_RANGE');
    await assertNoConflict(appointment.doctorId, newStart, newEnd, appointment._id);
    appointment.startAt = newStart;
    appointment.endAt = newEnd;
  }

  if (updates.reason !== undefined) appointment.reason = updates.reason;
  if (updates.status !== undefined) appointment.status = updates.status;

  await appointment.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.APPOINTMENT_UPDATE,
    resourceType: 'Appointment',
    resourceId: appointment._id,
    metadata: { updates },
  });

  return appointment;
}

async function cancelAppointment(id, reason, req) {
  const appointment = await Appointment.findById(id).populate('patientId').populate('doctorId');
  if (!appointment) throw ApiError.notFound('Appointment not found.', 'APPOINTMENT_NOT_FOUND');
  if (req.user.role === ROLES.PATIENT && appointment.patientId?.userId?.toString() !== req.user.id) {
    throw ApiError.forbidden('You are not permitted to cancel this appointment.', 'RESOURCE_ACCESS_DENIED');
  }
  assertMutable(appointment);

  const originalStartAt = appointment.startAt;
  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancelledAt = new Date();
  appointment.cancellationReason = reason || null;
  await appointment.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.APPOINTMENT_CANCEL,
    resourceType: 'Appointment',
    resourceId: appointment._id,
    metadata: { reason },
  });

  if (appointment.patientId?.contact?.email) {
    emailService.sendTemplate(appointment.patientId.contact.email, 'appointmentCancelled', {
      name: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      doctorName: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
      startAt: formatDateTimeForEmail(originalStartAt),
      reason,
    });
  }

  return appointment;
}

async function rescheduleAppointment(id, startAt, endAt, req) {
  const appointment = await Appointment.findById(id).populate('patientId').populate('doctorId');
  if (!appointment) throw ApiError.notFound('Appointment not found.', 'APPOINTMENT_NOT_FOUND');
  assertMutable(appointment);

  const newStart = new Date(startAt);
  const newEnd = new Date(endAt);
  if (newEnd <= newStart) throw ApiError.badRequest('endAt must be after startAt.', 'INVALID_TIME_RANGE');

  await assertNoConflict(appointment.doctorId._id, newStart, newEnd, appointment._id);

  appointment.startAt = newStart;
  appointment.endAt = newEnd;
  appointment.status = APPOINTMENT_STATUS.SCHEDULED;
  await appointment.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.APPOINTMENT_RESCHEDULE,
    resourceType: 'Appointment',
    resourceId: appointment._id,
    metadata: { startAt: newStart, endAt: newEnd },
  });

  if (appointment.patientId?.contact?.email) {
    emailService.sendTemplate(appointment.patientId.contact.email, 'appointmentRescheduled', {
      name: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      doctorName: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
      startAt: formatDateTimeForEmail(newStart),
    });
  }

  return appointment;
}

async function checkInAppointment(id, req) {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw ApiError.notFound('Appointment not found.', 'APPOINTMENT_NOT_FOUND');

  if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) {
    throw ApiError.conflict(
      `Cannot check in an appointment with status '${appointment.status}'.`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  appointment.status = APPOINTMENT_STATUS.CHECKED_IN;
  appointment.checkedInAt = new Date();
  await appointment.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.APPOINTMENT_CHECK_IN,
    resourceType: 'Appointment',
    resourceId: appointment._id,
  });

  return appointment;
}

module.exports = {
  bookAppointment,
  listAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  checkInAppointment,
};
