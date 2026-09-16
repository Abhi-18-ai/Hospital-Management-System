'use strict';

// Separate router mounted at /api/v1/patients to expose:
// GET /patients/:patientId/prescriptions - Patient prescriptions.
const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const prescriptionValidation = require('./prescription.validation');
const prescriptionController = require('./prescription.controller');

const router = express.Router();

const CAN_VIEW = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST, ROLES.PATIENT];

router.get(
  '/:patientId/prescriptions',
  authenticate,
  authorize(...CAN_VIEW),
  validate(prescriptionValidation.listPatientPrescriptions),
  prescriptionController.listForPatient
);

module.exports = router;
