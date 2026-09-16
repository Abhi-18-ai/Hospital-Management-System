'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const prescriptionValidation = require('./prescription.validation');
const prescriptionController = require('./prescription.controller');

const router = express.Router();

const CAN_VIEW = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST, ROLES.PATIENT];

// POST /api/v1/prescriptions - Create prescription.
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(prescriptionValidation.createPrescription),
  prescriptionController.create
);

// GET /api/v1/prescriptions/:id - Get prescription.
router.get(
  '/:id',
  authenticate,
  authorize(...CAN_VIEW),
  validate(prescriptionValidation.getPrescription),
  prescriptionController.getById
);

// PATCH /api/v1/prescriptions/:id - Update/correct according to policy.
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(prescriptionValidation.updatePrescription),
  prescriptionController.update
);

module.exports = router;
