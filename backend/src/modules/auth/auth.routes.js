'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');

const router = express.Router();

// POST /api/v1/auth/register - Register a user where permitted.
router.post('/register', authLimiter, validate(authValidation.register), authController.register);

// POST /api/v1/auth/login - Authenticate and create session/tokens.
router.post('/login', authLimiter, validate(authValidation.login), authController.login);

// POST /api/v1/auth/refresh - Refresh access session/token.
router.post('/refresh', authLimiter, authController.refreshSession);

// POST /api/v1/auth/logout - Invalidate current session/refresh token.
router.post('/logout', authController.logout);

// GET /api/v1/auth/me - Return authenticated user.
router.get('/me', authenticate, authController.me);

// POST /api/v1/auth/change-password - Change password.
router.post(
  '/change-password',
  authenticate,
  validate(authValidation.changePassword),
  authController.changePassword
);

// POST /api/v1/auth/forgot-password - Start password reset.
router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);

// POST /api/v1/auth/reset-password - Complete password reset.
router.post(
  '/reset-password',
  authLimiter,
  validate(authValidation.resetPassword),
  authController.resetPassword
);

module.exports = router;
