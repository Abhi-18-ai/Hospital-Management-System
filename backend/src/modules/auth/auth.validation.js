'use strict';

const Joi = require('joi');
const { ROLES } = require('../../utils/constants');

const passwordRule = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .message('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.');

// Only roles that are permitted to self-register through the public endpoint.
// Staff roles (admins, doctors, etc.) are provisioned by an administrator via /users.
const SELF_REGISTERABLE_ROLES = [ROLES.PATIENT, ROLES.RECEPTIONIST];

const register = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().max(30).allow(null, ''),
    password: passwordRule.required(),
    role: Joi.string()
      .valid(...SELF_REGISTERABLE_ROLES)
      .default(ROLES.PATIENT),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordRule.required(),
  }),
};

const forgotPassword = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    token: Joi.string().required(),
    newPassword: passwordRule.required(),
  }),
};

module.exports = { register, login, changePassword, forgotPassword, resetPassword, SELF_REGISTERABLE_ROLES };
