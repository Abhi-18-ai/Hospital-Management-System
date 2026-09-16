'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const doctorValidation = require('./doctor.validation');
const doctorController = require('./doctor.controller');

const router = express.Router();
const adminOnly = authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN);
const ANY_AUTHENTICATED = authorize();

// POST /api/v1/doctors - Create doctor profile.
router.post('/', authenticate, adminOnly, validate(doctorValidation.createDoctor), doctorController.create);

// GET /api/v1/doctors - List/search doctors.
router.get('/', authenticate, ANY_AUTHENTICATED, validate(doctorValidation.listDoctors), doctorController.list);

// GET /api/v1/doctors/:id - Get doctor.
router.get('/:id', authenticate, ANY_AUTHENTICATED, validate(doctorValidation.getDoctor), doctorController.getById);

// PATCH /api/v1/doctors/:id - Update doctor.
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(doctorValidation.updateDoctor),
  doctorController.update
);

// GET /api/v1/doctors/:id/availability - Get availability.
router.get(
  '/:id/availability',
  authenticate,
  ANY_AUTHENTICATED,
  validate(doctorValidation.getAvailability),
  doctorController.getAvailability
);

// PATCH /api/v1/doctors/:id/schedule - Update schedule.
router.patch(
  '/:id/schedule',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR),
  validate(doctorValidation.updateSchedule),
  doctorController.updateSchedule
);

module.exports = router;
