'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');

const scheduleSlot = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
});

const createDoctor = {
  body: Joi.object({
    userId: objectIdRequired,
    firstName: Joi.string().trim().min(1).max(80).required(),
    lastName: Joi.string().trim().min(1).max(80).required(),
    departmentId: objectIdRequired,
    specialization: Joi.string().trim().min(2).max(150).required(),
    licenseNumber: Joi.string().trim().min(2).max(60).required(),
    consultationFee: Joi.number().min(0),
    schedule: Joi.array().items(scheduleSlot),
  }),
};

const listDoctors = {
  query: Joi.object({
    ...paginationQuery,
    departmentId: Joi.string(),
    specialization: Joi.string().trim().max(150),
    status: Joi.string().valid('active', 'inactive', 'on_leave'),
    search: Joi.string().trim().max(120),
  }),
};

const getDoctor = { params: Joi.object({ id: objectIdRequired }) };

const updateDoctor = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(80),
    lastName: Joi.string().trim().min(1).max(80),
    departmentId: objectIdRequired,
    specialization: Joi.string().trim().min(2).max(150),
    licenseNumber: Joi.string().trim().min(2).max(60),
    consultationFee: Joi.number().min(0),
    status: Joi.string().valid('active', 'inactive', 'on_leave'),
  }).min(1),
};

const getAvailability = {
  params: Joi.object({ id: objectIdRequired }),
  query: Joi.object({
    date: Joi.date().iso().required(),
  }),
};

const updateSchedule = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    schedule: Joi.array().items(scheduleSlot).required(),
  }),
};

module.exports = { createDoctor, listDoctors, getDoctor, updateDoctor, getAvailability, updateSchedule };
