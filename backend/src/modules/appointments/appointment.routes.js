'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const appointmentValidation = require('./appointment.validation');
const appointmentController = require('./appointment.controller');

const router = express.Router();

const CAN_BOOK = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT];
const CAN_MANAGE = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR];
const CAN_VIEW = [
  ROLES.SUPER_ADMIN,
  ROLES.HOSPITAL_ADMIN,
  ROLES.RECEPTIONIST,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.PATIENT,
];

// POST /api/v1/appointments - Book appointment.
router.post(
  '/',
  authenticate,
  authorize(...CAN_BOOK),
  validate(appointmentValidation.createAppointment),
  appointmentController.create
);

// GET /api/v1/appointments - List/filter appointments.
router.get(
  '/',
  authenticate,
  authorize(...CAN_VIEW),
  validate(appointmentValidation.listAppointments),
  appointmentController.list
);

// GET /api/v1/appointments/:id - Get appointment.
router.get(
  '/:id',
  authenticate,
  authorize(...CAN_VIEW),
  validate(appointmentValidation.getAppointment),
  appointmentController.getById
);

// PATCH /api/v1/appointments/:id - Update appointment.
router.patch(
  '/:id',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(appointmentValidation.updateAppointment),
  appointmentController.update
);

// POST /api/v1/appointments/:id/cancel - Cancel appointment.
router.post(
  '/:id/cancel',
  authenticate,
  authorize(...CAN_BOOK, ROLES.DOCTOR),
  validate(appointmentValidation.cancelAppointment),
  appointmentController.cancel
);

// POST /api/v1/appointments/:id/reschedule - Reschedule appointment.
router.post(
  '/:id/reschedule',
  authenticate,
  authorize(...CAN_MANAGE),
  validate(appointmentValidation.rescheduleAppointment),
  appointmentController.reschedule
);

// POST /api/v1/appointments/:id/check-in - Mark patient checked in.
router.post(
  '/:id/check-in',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.NURSE),
  validate(appointmentValidation.checkInAppointment),
  appointmentController.checkIn
);

module.exports = router;
