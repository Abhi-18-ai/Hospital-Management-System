'use strict';

const Patient = require('./patient.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS } = require('../../utils/constants');
const { generateCode } = require('../../utils/idHelpers');

async function createPatient(payload, req) {
  let mrn = generateCode('MRN');
  // Extremely small chance of collision; retry once with a fresh code if needed.
  // eslint-disable-next-line no-await-in-loop
  while (await Patient.exists({ mrn })) {
    mrn = generateCode('MRN');
  }

  const patient = await Patient.create({
    ...payload,
    mrn,
    registeredBy: req.user.id,
  });

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.PATIENT_CREATE,
    resourceType: 'Patient',
    resourceId: patient._id,
  });

  return patient;
}

async function listPatients(filters, { page, limit, skip }) {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ firstName: regex }, { lastName: regex }, { mrn: regex }, { 'contact.phone': regex }];
  }

  const [items, total] = await Promise.all([
    Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Patient.countDocuments(query),
  ]);

  return { items, total };
}

async function getPatientById(id) {
  const patient = await Patient.findById(id);
  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');
  return patient;
}

async function updatePatient(id, updates, req) {
  const patient = await getPatientById(id);

  Object.assign(patient, updates);
  if (updates.contact) patient.contact = { ...patient.contact.toObject(), ...updates.contact };
  if (updates.emergencyContact) {
    patient.emergencyContact = { ...patient.emergencyContact.toObject(), ...updates.emergencyContact };
  }

  await patient.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.PATIENT_UPDATE,
    resourceType: 'Patient',
    resourceId: patient._id,
    metadata: { updates },
  });

  return patient;
}

async function getPatientHistory(id) {
  await getPatientById(id);

  // Lazily required to avoid module load-order issues across sibling domains.
  const Appointment = require('../appointments/appointment.model');
  const MedicalRecord = require('../medicalRecords/medicalRecord.model');
  const Prescription = require('../prescriptions/prescription.model');
  const Admission = require('../admissions/admission.model');

  const [appointments, medicalRecords, prescriptions, admissions] = await Promise.all([
    Appointment.find({ patientId: id }).sort({ startAt: -1 }).limit(50).populate('doctorId', 'firstName lastName'),
    MedicalRecord.find({ patientId: id }).sort({ encounterAt: -1 }).limit(50),
    Prescription.find({ patientId: id }).sort({ issuedAt: -1 }).limit(50),
    Admission.find({ patientId: id }).sort({ admittedAt: -1 }).limit(20),
  ]);

  return { appointments, medicalRecords, prescriptions, admissions };
}

async function getPatientAppointments(id, { page, limit, skip }) {
  await getPatientById(id);
  const Appointment = require('../appointments/appointment.model');

  const query = { patientId: id };
  const [items, total] = await Promise.all([
    Appointment.find(query)
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('doctorId', 'firstName lastName')
      .populate('departmentId', 'name'),
    Appointment.countDocuments(query),
  ]);

  return { items, total };
}

module.exports = {
  createPatient,
  listPatients,
  getPatientById,
  updatePatient,
  getPatientHistory,
  getPatientAppointments,
};
