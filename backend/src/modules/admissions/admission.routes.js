'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const admissionValidation = require('./admission.validation');
const admissionController = require('./admission.controller');

const router = express.Router();

const ADMISSION_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE];
const CAN_VIEW = [...ADMISSION_STAFF, ROLES.PATIENT];

// IMPORTANT: /beds/availability must be registered before /:id-style routes
// at the mount level (see routes/index.js) to avoid path collisions.

// POST /api/v1/admissions - Admit patient.
router.post('/', authenticate, authorize(...ADMISSION_STAFF), validate(admissionValidation.admitPatient), admissionController.admit);

// GET /api/v1/admissions - List admissions.
router.get('/', authenticate, authorize(...CAN_VIEW), validate(admissionValidation.listAdmissions), admissionController.list);

// GET /api/v1/admissions/:id - Get admission.
router.get(
  '/:id',
  authenticate,
  authorize(...CAN_VIEW),
  validate(admissionValidation.getAdmission),
  admissionController.getById
);

// POST /api/v1/admissions/:id/transfer - Transfer ward/room/bed.
router.post(
  '/:id/transfer',
  authenticate,
  authorize(...ADMISSION_STAFF),
  validate(admissionValidation.transferAdmission),
  admissionController.transfer
);

// POST /api/v1/admissions/:id/discharge - Discharge patient.
router.post(
  '/:id/discharge',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(admissionValidation.dischargePatient),
  admissionController.discharge
);

module.exports = router;
