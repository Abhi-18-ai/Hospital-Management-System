'use strict';

const Joi = require('joi');
const { objectIdRequired, objectId, paginationQuery } = require('../../utils/joiCommon');
const { ADMISSION_STATUS } = require('../../utils/constants');

const admitPatient = {
  body: Joi.object({
    patientId: objectIdRequired,
    doctorId: objectIdRequired,
    ward: Joi.string().trim().min(1).max(60).required(),
    room: Joi.string().trim().min(1).max(30).required(),
    bed: Joi.string().trim().min(1).max(30).required(),
    reason: Joi.string().trim().max(500).allow(''),
  }),
};

const listAdmissions = {
  query: Joi.object({
    ...paginationQuery,
    patientId: objectId,
    status: Joi.string().valid(...Object.values(ADMISSION_STATUS)),
    ward: Joi.string().trim().max(60),
  }),
};

const getAdmission = { params: Joi.object({ id: objectIdRequired }) };

const transferAdmission = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    ward: Joi.string().trim().min(1).max(60).required(),
    room: Joi.string().trim().min(1).max(30).required(),
    bed: Joi.string().trim().min(1).max(30).required(),
  }),
};

const dischargePatient = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    dischargeSummary: Joi.string().trim().max(3000).allow(''),
  }),
};

const bedsAvailability = {
  query: Joi.object({
    ward: Joi.string().trim().max(60),
  }),
};

module.exports = { admitPatient, listAdmissions, getAdmission, transferAdmission, dischargePatient, bedsAvailability };
