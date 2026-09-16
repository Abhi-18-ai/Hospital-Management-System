'use strict';

const Joi = require('joi');
const { objectIdRequired, objectId, paginationQuery } = require('../../utils/joiCommon');
const { PATIENT_STATUS } = require('../../utils/constants');

const createPatient = {
  body: Joi.object({
    userId: objectId.allow(null),
    firstName: Joi.string().trim().min(1).max(80).required(),
    lastName: Joi.string().trim().min(1).max(80).required(),
    dateOfBirth: Joi.date().iso().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'),
    contact: Joi.object({
      phone: Joi.string().trim().min(6).max(20).required(),
      email: Joi.string().trim().email().allow(null, ''),
      address: Joi.string().trim().max(300).allow(''),
    }).required(),
    emergencyContact: Joi.object({
      name: Joi.string().trim().max(120).allow(''),
      relationship: Joi.string().trim().max(60).allow(''),
      phone: Joi.string().trim().max(20).allow(''),
    }),
    allergies: Joi.array().items(Joi.string().trim().max(120)),
  }),
};

const listPatients = {
  query: Joi.object({
    ...paginationQuery,
    status: Joi.string().valid(...Object.values(PATIENT_STATUS)),
    search: Joi.string().trim().max(120),
  }),
};

const getPatient = { params: Joi.object({ id: objectIdRequired }) };

const updatePatient = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    firstName: Joi.string().trim().min(1).max(80),
    lastName: Joi.string().trim().min(1).max(80),
    dateOfBirth: Joi.date().iso().max('now'),
    gender: Joi.string().valid('male', 'female', 'other'),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'),
    contact: Joi.object({
      phone: Joi.string().trim().min(6).max(20),
      email: Joi.string().trim().email().allow(null, ''),
      address: Joi.string().trim().max(300).allow(''),
    }),
    emergencyContact: Joi.object({
      name: Joi.string().trim().max(120).allow(''),
      relationship: Joi.string().trim().max(60).allow(''),
      phone: Joi.string().trim().max(20).allow(''),
    }),
    allergies: Joi.array().items(Joi.string().trim().max(120)),
    status: Joi.string().valid(...Object.values(PATIENT_STATUS)),
  }).min(1),
};

const patientIdParam = { params: Joi.object({ id: objectIdRequired }) };

module.exports = { createPatient, listPatients, getPatient, updatePatient, patientIdParam };
