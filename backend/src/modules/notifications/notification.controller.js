'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const notificationService = require('./notification.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total, unreadCount } = await notificationService.listForUser(req.user.id, req.query, pagination);
  new ApiResponse(200, items, 'Notifications retrieved successfully.', {
    ...buildMeta({ ...pagination, total }),
    unreadCount,
  }).send(res);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  new ApiResponse(200, notification, 'Notification marked as read.').send(res);
});

module.exports = { list, markAsRead };
