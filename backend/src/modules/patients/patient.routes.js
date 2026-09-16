'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize, authorizeOwnership } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const patientValidation = require('./patient.validation');
const patientController = require('./patient.controller');
const Patient = require('./patient.model');

const router = express.Router();

const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HOSPITAL_ADMIN,
  ROLES.RECEPTIONIST,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.LAB_TECHNICIAN,
  ROLES.PHARMACIST,
  ROLES.ACCOUNTANT,
];

const CAN_REGISTER_PATIENTS = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST];
const CAN_UPDATE_PATIENTS = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE];

// Resource-level check: a `patient` role user may only access their own record.
const ownPatientRecordOnly = authorizeOwnership(async (req) => {
  const patient = await Patient.findById(req.params.id).select('userId');
  return !!patient && patient.userId && patient.userId.toString() === req.user.id;
}, STAFF_ROLES);

// POST /api/v1/patients - Create patient.
router.post(
  '/',
  authenticate,
  authorize(...CAN_REGISTER_PATIENTS),
  validate(patientValidation.createPatient),
  patientController.create
);

// GET /api/v1/patients - List/search patients.
router.get('/', authenticate, authorize(...STAFF_ROLES), validate(patientValidation.listPatients), patientController.list);

// GET /api/v1/patients/:id - Get patient.
router.get(
  '/:id',
  authenticate,
  authorize(...STAFF_ROLES, ROLES.PATIENT),
  validate(patientValidation.getPatient),
  ownPatientRecordOnly,
  patientController.getById
);

// PATCH /api/v1/patients/:id - Update patient.
router.patch(
  '/:id',
  authenticate,
  authorize(...CAN_UPDATE_PATIENTS),
  validate(patientValidation.updatePatient),
  patientController.update
);

// GET /api/v1/patients/:id/history - Get clinical/appointment summary.
router.get(
  '/:id/history',
  authenticate,
  authorize(...STAFF_ROLES, ROLES.PATIENT),
  validate(patientValidation.patientIdParam),
  ownPatientRecordOnly,
  patientController.getHistory
);

// GET /api/v1/patients/:id/appointments - Patient appointments.
router.get(
  '/:id/appointments',
  authenticate,
  authorize(...STAFF_ROLES, ROLES.PATIENT),
  validate(patientValidation.getPatient),
  ownPatientRecordOnly,
  patientController.getAppointments
);

module.exports = router;
