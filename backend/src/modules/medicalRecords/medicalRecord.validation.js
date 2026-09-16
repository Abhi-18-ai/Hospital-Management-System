'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');

const vitals = Joi.object({
  temperatureC: Joi.number().min(20).max(45),
  heartRateBpm: Joi.number().min(20).max(300),
  bloodPressure: Joi.string()
    .pattern(/^\d{2,3}\/\d{2,3}$/)
    .messages({ 'string.pattern.base': 'bloodPressure must be in the form systolic/diastolic, e.g. 120/80' }),
  respiratoryRate: Joi.number().min(1).max(100),
  spo2: Joi.number().min(0).max(100),
  heightCm: Joi.number().min(0).max(300),
  weightKg: Joi.number().min(0).max(500),
});

const createMedicalRecord = {
  body: Joi.object({
    patientId: objectIdRequired,
    doctorId: objectIdRequired,
    appointmentId: Joi.string().trim().allow(null),
    encounterAt: Joi.date().iso(),
    chiefComplaint: Joi.string().trim().max(500).allow(''),
    diagnoses: Joi.array().items(Joi.string().trim().max(200)),
    vitals,
    notes: Joi.string().trim().max(5000).allow(''),
    attachments: Joi.array().items(Joi.string().trim().max(500)),
  }),
};

const getMedicalRecord = { params: Joi.object({ id: objectIdRequired }) };

const updateMedicalRecord = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    chiefComplaint: Joi.string().trim().max(500).allow(''),
    diagnoses: Joi.array().items(Joi.string().trim().max(200)),
    vitals,
    notes: Joi.string().trim().max(5000).allow(''),
    attachments: Joi.array().items(Joi.string().trim().max(500)),
  }).min(1),
};

const listPatientMedicalRecords = {
  params: Joi.object({ patientId: objectIdRequired }),
  query: Joi.object({ ...paginationQuery }),
};

module.exports = { createMedicalRecord, getMedicalRecord, updateMedicalRecord, listPatientMedicalRecords };
