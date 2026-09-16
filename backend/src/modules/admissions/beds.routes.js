'use strict';

// Separate router for GET /api/v1/beds/availability - Available beds.
const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const admissionValidation = require('./admission.validation');
const admissionController = require('./admission.controller');

const router = express.Router();

router.get(
  '/availability',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE),
  validate(admissionValidation.bedsAvailability),
  admissionController.bedsAvailability
);

module.exports = router;
