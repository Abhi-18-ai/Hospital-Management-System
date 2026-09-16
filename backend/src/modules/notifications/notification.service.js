'use strict';

const Notification = require('./notification.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

/**
 * Creates an in-app notification. Non-critical: failures are logged, not thrown,
 * so a notification failure never rolls back the primary business transaction.
 */
async function notify({ userId, type, title, message, metadata = {} }) {
  try {
    return await Notification.create({ userId, type, title, message, metadata });
  } catch (err) {
    logger.error(`Failed to create notification for user=${userId}: ${err.message}`);
    return null;
  }
}

async function listForUser(userId, filters, { page, limit, skip }) {
  const query = { userId };
  if (filters.unreadOnly === 'true' || filters.unreadOnly === true) {
    query.readAt = null;
  }

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, readAt: null }),
  ]);

  return { items, total, unreadCount };
}

async function markAsRead(id, userId) {
  const notification = await Notification.findOne({ _id: id, userId });
  if (!notification) throw ApiError.notFound('Notification not found.', 'NOTIFICATION_NOT_FOUND');

  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
}

module.exports = { notify, listForUser, markAsRead };
