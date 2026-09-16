'use strict';

const Prescription = require('./prescription.model');
const Patient = require('../patients/patient.model');
const Doctor = require('../doctors/doctor.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const notificationService = require('../notifications/notification.service');
const emailService = require('../notifications/email.service');
const { AUDIT_ACTIONS, PRESCRIPTION_STATUS, NOTIFICATION_TYPE, ROLES } = require('../../utils/constants');

async function createPrescription(payload, req) {
  const [patient, doctor] = await Promise.all([
    Patient.findById(payload.patientId),
    Doctor.findById(payload.doctorId),
  ]);

  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');

  const prescription = await Prescription.create(payload);

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.PRESCRIPTION_CREATE,
    resourceType: 'Prescription',
    resourceId: prescription._id,
  });

  if (patient.userId) {
    await notificationService.notify({
      userId: patient.userId,
      type: NOTIFICATION_TYPE.PRESCRIPTION_READY,
      title: 'New prescription issued',
      message: 'A new prescription has been issued for you.',
      metadata: { prescriptionId: prescription._id },
    });
  }

  if (patient.contact?.email) {
    emailService.sendTemplate(patient.contact.email, 'prescriptionReady', {
      name: `${patient.firstName} ${patient.lastName}`,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
    });
  }

  return prescription;
}

async function getPrescriptionById(id) {
  const prescription = await Prescription.findById(id)
    .populate('patientId', 'firstName lastName mrn')
    .populate('doctorId', 'firstName lastName specialization');
  if (!prescription) throw ApiError.notFound('Prescription not found.', 'PRESCRIPTION_NOT_FOUND');
  return prescription;
}

async function updatePrescription(id, updates, req) {
  const prescription = await Prescription.findById(id);
  if (!prescription) throw ApiError.notFound('Prescription not found.', 'PRESCRIPTION_NOT_FOUND');

  if (prescription.status !== PRESCRIPTION_STATUS.ACTIVE) {
    throw ApiError.conflict(
      `Prescription with status '${prescription.status}' can no longer be modified.`,
      'PRESCRIPTION_NOT_MUTABLE'
    );
  }

  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(req.user.role);
  if (req.user.role === ROLES.DOCTOR && !isAdmin) {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id }).select('_id');
    const isOwner = doctorProfile && prescription.doctorId.toString() === doctorProfile._id.toString();
    if (!isOwner) {
      throw ApiError.forbidden(
        'Only the prescribing doctor or an administrator may amend this prescription.',
        'PRESCRIPTION_UPDATE_FORBIDDEN'
      );
    }
  }

  if (updates.items !== undefined) prescription.items = updates.items;
  if (updates.notes !== undefined) prescription.notes = updates.notes;
  if (updates.status !== undefined) prescription.status = updates.status;

  await prescription.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.PRESCRIPTION_UPDATE,
    resourceType: 'Prescription',
    resourceId: prescription._id,
    metadata: { updates },
  });

  return prescription;
}

async function listPatientPrescriptions(patientId, { page, limit, skip }) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');

  const query = { patientId };
  const [items, total] = await Promise.all([
    Prescription.find(query)
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('doctorId', 'firstName lastName specialization'),
    Prescription.countDocuments(query),
  ]);

  return { items, total };
}

module.exports = { createPrescription, getPrescriptionById, updatePrescription, listPatientPrescriptions };
