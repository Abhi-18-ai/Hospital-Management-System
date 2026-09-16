'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');

const createDepartment = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    code: Joi.string().trim().min(2).max(20).required(),
    description: Joi.string().trim().max(1000).allow(''),
  }),
};

const listDepartments = {
  query: Joi.object({
    ...paginationQuery,
    status: Joi.string().valid('active', 'inactive'),
    search: Joi.string().trim().max(120),
  }),
};

const getDepartment = { params: Joi.object({ id: objectIdRequired }) };

const updateDepartment = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    code: Joi.string().trim().min(2).max(20),
    description: Joi.string().trim().max(1000).allow(''),
    status: Joi.string().valid('active', 'inactive'),
  }).min(1),
};

module.exports = { createDepartment, listDepartments, getDepartment, updateDepartment };
