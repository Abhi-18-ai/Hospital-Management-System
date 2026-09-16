'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');
const { ALL_ROLES, USER_STATUS } = require('../../utils/constants');

const listUsers = {
  query: Joi.object({
    ...paginationQuery,
    role: Joi.string().valid(...ALL_ROLES),
    status: Joi.string().valid(...Object.values(USER_STATUS)),
    search: Joi.string().trim().max(120),
  }),
};

const getUser = {
  params: Joi.object({ id: objectIdRequired }),
};

const updateUser = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    name: Joi.string().trim().max(120),
    phone: Joi.string().trim().max(30).allow(null, ''),
    role: Joi.string().valid(...ALL_ROLES),
  }).min(1),
};

const updateUserStatus = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    status: Joi.string()
      .valid(...Object.values(USER_STATUS))
      .required(),
  }),
};

module.exports = { listUsers, getUser, updateUser, updateUserStatus };
