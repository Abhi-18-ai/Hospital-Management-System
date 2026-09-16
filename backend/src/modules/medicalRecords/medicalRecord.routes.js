'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize, authorizeOwnership } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const medicalRecordValidation = require('./medicalRecord.validation');
const medicalRecordController = require('./medicalRecord.controller');
const MedicalRecord = require('./medicalRecord.model');

const router = express.Router();

const CLINICAL_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE];
const CAN_VIEW = [...CLINICAL_STAFF, ROLES.LAB_TECHNICIAN, ROLES.PATIENT];
const STAFF_ROLES = CAN_VIEW.filter((role) => role !== ROLES.PATIENT);
const ownMedicalRecordOnly = authorizeOwnership(async (req) => {
  const record = await MedicalRecord.findById(req.params.id).populate('patientId', 'userId');
  return !!record?.patientId && record.patientId.userId?.toString() === req.user.id;
}, STAFF_ROLES);

// POST /api/v1/medical-records - Create encounter/clinical record.
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(medicalRecordValidation.createMedicalRecord),
  medicalRecordController.create
);

// GET /api/v1/medical-records/:id - Get clinical record.
router.get(
  '/:id',
  authenticate,
  authorize(...CAN_VIEW),
  ownMedicalRecordOnly,
  validate(medicalRecordValidation.getMedicalRecord),
  medicalRecordController.getById
);

// PATCH /api/v1/medical-records/:id - Update permitted fields.
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(medicalRecordValidation.updateMedicalRecord),
  medicalRecordController.update
);

module.exports = router;
