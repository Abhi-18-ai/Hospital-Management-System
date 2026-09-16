'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize, authorizeOwnership } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const prescriptionValidation = require('./prescription.validation');
const prescriptionController = require('./prescription.controller');
const Prescription = require('./prescription.model');

const router = express.Router();

const CAN_VIEW = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PHARMACIST, ROLES.PATIENT];
const STAFF_ROLES = CAN_VIEW.filter((role) => role !== ROLES.PATIENT);
const ownPrescriptionOnly = authorizeOwnership(async (req) => {
  const prescription = await Prescription.findById(req.params.id).populate('patientId', 'userId');
  return !!prescription?.patientId && prescription.patientId.userId?.toString() === req.user.id;
}, STAFF_ROLES);

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
  ownPrescriptionOnly,
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
