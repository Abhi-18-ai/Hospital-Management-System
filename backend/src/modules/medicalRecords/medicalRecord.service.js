'use strict';

const MedicalRecord = require('./medicalRecord.model');
const Patient = require('../patients/patient.model');
const Doctor = require('../doctors/doctor.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS, ROLES } = require('../../utils/constants');

async function createMedicalRecord(payload, req) {
  const [patient, doctor] = await Promise.all([
    Patient.findById(payload.patientId),
    Doctor.findById(payload.doctorId),
  ]);

  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');

  const record = await MedicalRecord.create({ ...payload, createdBy: req.user.id });

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.MEDICAL_RECORD_CREATE,
    resourceType: 'MedicalRecord',
    resourceId: record._id,
  });

  return record;
}

async function getMedicalRecordById(id) {
  const record = await MedicalRecord.findById(id)
    .populate('patientId', 'firstName lastName mrn')
    .populate('doctorId', 'firstName lastName specialization');
  if (!record) throw ApiError.notFound('Medical record not found.', 'MEDICAL_RECORD_NOT_FOUND');
  return record;
}

async function updateMedicalRecord(id, updates, req) {
  const record = await MedicalRecord.findById(id);
  if (!record) throw ApiError.notFound('Medical record not found.', 'MEDICAL_RECORD_NOT_FOUND');

  if (record.lockedAt) {
    throw ApiError.conflict('This medical record has been finalized and can no longer be edited.', 'RECORD_LOCKED');
  }

  // Only the authoring doctor or an administrator may amend a clinical record.
  const isOwner = record.createdBy.toString() === req.user.id;
  const isAdmin = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(req.user.role);
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Only the authoring clinician or an administrator may amend this record.', 'RECORD_UPDATE_FORBIDDEN');
  }

  if (updates.chiefComplaint !== undefined) record.chiefComplaint = updates.chiefComplaint;
  if (updates.diagnoses !== undefined) record.diagnoses = updates.diagnoses;
  if (updates.vitals !== undefined) record.vitals = { ...record.vitals.toObject(), ...updates.vitals };
  if (updates.notes !== undefined) record.notes = updates.notes;
  if (updates.attachments !== undefined) record.attachments = updates.attachments;

  await record.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.MEDICAL_RECORD_UPDATE,
    resourceType: 'MedicalRecord',
    resourceId: record._id,
    metadata: { updates },
  });

  return record;
}

async function listPatientMedicalRecords(patientId, { page, limit, skip }) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');

  const query = { patientId };
  const [items, total] = await Promise.all([
    MedicalRecord.find(query)
      .sort({ encounterAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('doctorId', 'firstName lastName specialization'),
    MedicalRecord.countDocuments(query),
  ]);

  return { items, total };
}

module.exports = { createMedicalRecord, getMedicalRecordById, updateMedicalRecord, listPatientMedicalRecords };
