'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const billingValidation = require('./billing.validation');
const billingController = require('./billing.controller');

const router = express.Router();

const BILLING_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST];
const CAN_VIEW = [...BILLING_STAFF, ROLES.PATIENT];

// POST /api/v1/billing/invoices - Create invoice.
router.post(
  '/invoices',
  authenticate,
  authorize(...BILLING_STAFF),
  validate(billingValidation.createInvoice),
  billingController.createInvoice
);

// GET /api/v1/billing/invoices - List invoices.
router.get(
  '/invoices',
  authenticate,
  authorize(...CAN_VIEW),
  validate(billingValidation.listInvoices),
  billingController.listInvoices
);

// GET /api/v1/billing/invoices/:id - Get invoice.
router.get(
  '/invoices/:id',
  authenticate,
  authorize(...CAN_VIEW),
  validate(billingValidation.getInvoice),
  billingController.getInvoiceById
);

// POST /api/v1/billing/invoices/:id/payments - Record payment.
router.post(
  '/invoices/:id/payments',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST),
  validate(billingValidation.recordPayment),
  billingController.recordPayment
);

// POST /api/v1/billing/payments/:id/refund - Refund where authorized.
router.post(
  '/payments/:id/refund',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT),
  validate(billingValidation.refundPayment),
  billingController.refundPayment
);

module.exports = router;
