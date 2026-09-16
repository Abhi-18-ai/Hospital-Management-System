'use strict';

const Joi = require('joi');
const { objectId } = require('../../utils/joiCommon');

const searchAuditLogs = {
  query: Joi.object({
    action: Joi.string().trim(),
    resourceType: Joi.string().trim(),
    resourceId: objectId,
    actorId: objectId,
    from: Joi.date().iso(),
    to: Joi.date().iso(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

module.exports = { searchAuditLogs };
