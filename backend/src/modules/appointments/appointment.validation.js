'use strict';

const Joi = require('joi');
const { objectIdRequired, objectId, paginationQuery } = require('../../utils/joiCommon');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

const createAppointment = {
  body: Joi.object({
    patientId: objectId,
    doctorId: objectIdRequired,
    departmentId: objectIdRequired,
    startAt: Joi.date().iso().greater('now').required(),
    endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
    reason: Joi.string().trim().max(500).allow(''),
  }),
};

const listAppointments = {
  query: Joi.object({
    ...paginationQuery,
    patientId: objectId,
    doctorId: objectId,
    departmentId: objectId,
    status: Joi.string().valid(...Object.values(APPOINTMENT_STATUS)),
    from: Joi.date().iso(),
    to: Joi.date().iso(),
  }),
};

const getAppointment = { params: Joi.object({ id: objectIdRequired }) };

const updateAppointment = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    startAt: Joi.date().iso(),
    endAt: Joi.date().iso(),
    reason: Joi.string().trim().max(500).allow(''),
    status: Joi.string().valid(...Object.values(APPOINTMENT_STATUS)),
  }).min(1),
};

const cancelAppointment = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).allow(''),
  }),
};

const rescheduleAppointment = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    startAt: Joi.date().iso().greater('now').required(),
    endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
  }),
};

const checkInAppointment = { params: Joi.object({ id: objectIdRequired }) };

module.exports = {
  createAppointment,
  listAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  checkInAppointment,
};
