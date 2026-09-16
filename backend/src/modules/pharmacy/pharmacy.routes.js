'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const pharmacyValidation = require('./pharmacy.validation');
const pharmacyController = require('./pharmacy.controller');

const router = express.Router();

const PHARMACY_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST];
const CAN_VIEW = [...PHARMACY_STAFF, ROLES.DOCTOR, ROLES.NURSE];

// POST /api/v1/pharmacy/medicines - Create medicine.
router.post(
  '/medicines',
  authenticate,
  authorize(...PHARMACY_STAFF),
  validate(pharmacyValidation.createMedicine),
  pharmacyController.createMedicine
);

// GET /api/v1/pharmacy/medicines - Search medicines.
router.get(
  '/medicines',
  authenticate,
  authorize(...CAN_VIEW),
  validate(pharmacyValidation.searchMedicines),
  pharmacyController.searchMedicines
);

// POST /api/v1/pharmacy/batches - Create stock batch.
router.post(
  '/batches',
  authenticate,
  authorize(...PHARMACY_STAFF),
  validate(pharmacyValidation.createBatch),
  pharmacyController.createBatch
);

// GET /api/v1/pharmacy/stock - Stock view.
router.get('/stock', authenticate, authorize(...CAN_VIEW), validate(pharmacyValidation.stockView), pharmacyController.stockView);

// POST /api/v1/pharmacy/dispense - Dispense medicine.
router.post(
  '/dispense',
  authenticate,
  authorize(...PHARMACY_STAFF),
  validate(pharmacyValidation.dispenseMedicine),
  pharmacyController.dispense
);

// GET /api/v1/pharmacy/low-stock - Low-stock medicines.
router.get(
  '/low-stock',
  authenticate,
  authorize(...PHARMACY_STAFF),
  validate(pharmacyValidation.lowStock),
  pharmacyController.lowStock
);

module.exports = router;
