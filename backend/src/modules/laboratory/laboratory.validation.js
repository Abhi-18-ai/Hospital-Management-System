'use strict';

const Joi = require('joi');
const { objectIdRequired, objectId, paginationQuery } = require('../../utils/joiCommon');
const { LAB_ORDER_STATUS, LAB_ORDER_PRIORITY } = require('../../utils/constants');

const createLabOrder = {
  body: Joi.object({
    patientId: objectIdRequired,
    doctorId: objectIdRequired,
    tests: Joi.array().items(Joi.string().trim().min(1).max(200)).min(1).required(),
    priority: Joi.string().valid(...Object.values(LAB_ORDER_PRIORITY)),
    notes: Joi.string().trim().max(1000).allow(''),
  }),
};

const listLabOrders = {
  query: Joi.object({
    ...paginationQuery,
    patientId: objectId,
    doctorId: objectId,
    status: Joi.string().valid(...Object.values(LAB_ORDER_STATUS)),
    priority: Joi.string().valid(...Object.values(LAB_ORDER_PRIORITY)),
  }),
};

const getLabOrder = { params: Joi.object({ id: objectIdRequired }) };

const updateLabOrderStatus = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    status: Joi.string()
      .valid(...Object.values(LAB_ORDER_STATUS))
      .required(),
  }),
};

const submitResults = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    results: Joi.array()
      .items(
        Joi.object({
          testName: Joi.string().trim().min(1).max(200).required(),
          values: Joi.object().unknown(true),
          referenceRange: Joi.string().trim().max(200).allow(''),
          interpretation: Joi.string().trim().max(1000).allow(''),
        })
      )
      .min(1)
      .required(),
  }),
};

const verifyResult = {
  params: Joi.object({ id: objectIdRequired }), // labResult id
  body: Joi.object({
    decision: Joi.string().valid('verify', 'reject').required(),
    comment: Joi.string().trim().max(500).allow(''),
  }),
};

module.exports = { createLabOrder, listLabOrders, getLabOrder, updateLabOrderStatus, submitResults, verifyResult };
