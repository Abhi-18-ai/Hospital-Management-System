'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const validate = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../utils/constants');
const userValidation = require('./user.validation');
const userController = require('./user.controller');

const router = express.Router();
const adminOnly = authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN);

// GET /api/v1/users - List users with filters/pagination.
router.get('/', authenticate, adminOnly, validate(userValidation.listUsers), userController.list);

// GET /api/v1/users/:id - Get user.
router.get('/:id', authenticate, adminOnly, validate(userValidation.getUser), userController.getById);

// PATCH /api/v1/users/:id - Update user.
router.patch('/:id', authenticate, adminOnly, validate(userValidation.updateUser), userController.update);

// PATCH /api/v1/users/:id/status - Activate/deactivate user.
router.patch(
  '/:id/status',
  authenticate,
  adminOnly,
  validate(userValidation.updateUserStatus),
  userController.updateStatus
);

module.exports = router;
