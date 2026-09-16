'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const auditValidation = require('./audit.validation');
const auditController = require('./audit.controller');

const router = express.Router();

// GET /api/v1/audit - Authorized audit search/reporting.
router.get(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN),
  validate(auditValidation.searchAuditLogs),
  auditController.search
);

module.exports = router;
