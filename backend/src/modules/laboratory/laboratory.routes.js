'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const labValidation = require('./laboratory.validation');
const labController = require('./laboratory.controller');

const router = express.Router();

const LAB_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.LAB_TECHNICIAN];
const CAN_VIEW = [...LAB_STAFF, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT];
const CAN_ORDER = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];
const CAN_VERIFY = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];

// POST /api/v1/lab/orders - Create lab order.
router.post('/orders', authenticate, authorize(...CAN_ORDER), validate(labValidation.createLabOrder), labController.create);

// GET /api/v1/lab/orders - List lab orders.
router.get('/orders', authenticate, authorize(...CAN_VIEW), validate(labValidation.listLabOrders), labController.list);

// GET /api/v1/lab/orders/:id - Get lab order.
router.get(
  '/orders/:id',
  authenticate,
  authorize(...CAN_VIEW),
  validate(labValidation.getLabOrder),
  labController.getById
);

// PATCH /api/v1/lab/orders/:id/status - Update lab workflow status.
router.patch(
  '/orders/:id/status',
  authenticate,
  authorize(...LAB_STAFF),
  validate(labValidation.updateLabOrderStatus),
  labController.updateStatus
);

// POST /api/v1/lab/orders/:id/results - Submit result.
router.post(
  '/orders/:id/results',
  authenticate,
  authorize(...LAB_STAFF),
  validate(labValidation.submitResults),
  labController.submitResults
);

// POST /api/v1/lab/results/:id/verify - Verify/release result.
router.post(
  '/results/:id/verify',
  authenticate,
  authorize(...CAN_VERIFY),
  validate(labValidation.verifyResult),
  labController.verifyResult
);

module.exports = router;
