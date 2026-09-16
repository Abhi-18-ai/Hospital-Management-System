'use strict';

const Joi = require('joi');

/**
 * Reusable Joi validator for MongoDB ObjectId strings.
 */
const objectId = Joi.string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('must be a valid MongoDB ObjectId');

const objectIdRequired = objectId.required();

const paginationQuery = {
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
};

module.exports = { objectId, objectIdRequired, paginationQuery };
