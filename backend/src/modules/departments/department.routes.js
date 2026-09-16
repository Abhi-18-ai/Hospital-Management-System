'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const departmentValidation = require('./department.validation');
const departmentController = require('./department.controller');

const router = express.Router();
const adminOnly = authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN);

// POST /api/v1/departments - Create department.
router.post('/', authenticate, adminOnly, validate(departmentValidation.createDepartment), departmentController.create);

// GET /api/v1/departments - List departments.
router.get('/', authenticate, validate(departmentValidation.listDepartments), departmentController.list);

// GET /api/v1/departments/:id - Get department.
router.get('/:id', authenticate, validate(departmentValidation.getDepartment), departmentController.getById);

// PATCH /api/v1/departments/:id - Update department.
router.patch(
  '/:id',
  authenticate,
  adminOnly,
  validate(departmentValidation.updateDepartment),
  departmentController.update
);

module.exports = router;
