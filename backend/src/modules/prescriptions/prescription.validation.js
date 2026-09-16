'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');
const { PRESCRIPTION_STATUS } = require('../../utils/constants');

const prescriptionItem = Joi.object({
  medicineName: Joi.string().trim().min(1).max(200).required(),
  dosage: Joi.string().trim().min(1).max(100).required(),
  frequency: Joi.string().trim().min(1).max(100).required(),
  durationDays: Joi.number().integer().min(1).required(),
  instructions: Joi.string().trim().max(300).allow(''),
});

const createPrescription = {
  body: Joi.object({
    patientId: objectIdRequired,
    doctorId: objectIdRequired,
    medicalRecordId: Joi.string().trim().allow(null),
    items: Joi.array().items(prescriptionItem).min(1).required(),
    notes: Joi.string().trim().max(1000).allow(''),
  }),
};

const getPrescription = { params: Joi.object({ id: objectIdRequired }) };

const updatePrescription = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    items: Joi.array().items(prescriptionItem).min(1),
    notes: Joi.string().trim().max(1000).allow(''),
    status: Joi.string().valid(...Object.values(PRESCRIPTION_STATUS)),
  }).min(1),
};

const listPatientPrescriptions = {
  params: Joi.object({ patientId: objectIdRequired }),
  query: Joi.object({ ...paginationQuery }),
};

module.exports = { createPrescription, getPrescription, updatePrescription, listPatientPrescriptions };
