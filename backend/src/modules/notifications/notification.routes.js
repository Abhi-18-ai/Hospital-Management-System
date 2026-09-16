'use strict';

const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const notificationValidation = require('./notification.validation');
const notificationController = require('./notification.controller');

const router = express.Router();

// GET /api/v1/notifications - List current-user notifications.
router.get(
  '/',
  authenticate,
  validate(notificationValidation.listNotifications),
  notificationController.list
);

// PATCH /api/v1/notifications/:id/read - Mark notification read.
router.patch(
  '/:id/read',
  authenticate,
  validate(notificationValidation.markAsRead),
  notificationController.markAsRead
);

module.exports = router;
