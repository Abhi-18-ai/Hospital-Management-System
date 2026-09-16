'use strict';

// Separate router mounted at /api/v1/patients to expose:
// GET /patients/:patientId/medical-records - Patient record history.
const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const medicalRecordValidation = require('./medicalRecord.validation');
const medicalRecordController = require('./medicalRecord.controller');

const router = express.Router();

const CAN_VIEW = [
  ROLES.SUPER_ADMIN,
  ROLES.HOSPITAL_ADMIN,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.LAB_TECHNICIAN,
  ROLES.PATIENT,
];

router.get(
  '/:patientId/medical-records',
  authenticate,
  authorize(...CAN_VIEW),
  validate(medicalRecordValidation.listPatientMedicalRecords),
  medicalRecordController.listForPatient
);

module.exports = router;
