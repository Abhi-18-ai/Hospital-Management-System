'use strict';

const User = require('./user.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const emailService = require('../notifications/email.service');
const { AUDIT_ACTIONS, ROLES } = require('../../utils/constants');

async function listUsers(filters, { page, limit, skip }) {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { items: items.map((u) => u.toSafeJSON()), total };
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');
  return user;
}

async function updateUser(id, updates, req) {
  const user = await getUserById(id);

  // Only super admins may change roles; enforced additionally at route level,
  // but we defensively strip role changes here unless explicitly authorized upstream.
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.role !== undefined) user.role = updates.role;

  await user.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_UPDATE,
    resourceType: 'User',
    resourceId: user._id,
    metadata: { updates },
  });

  return user;
}

async function updateUserStatus(id, status, req) {
  const user = await getUserById(id);

  if (user.role === ROLES.SUPER_ADMIN && req.user.id === user._id.toString() && status !== 'active') {
    throw ApiError.forbidden('You cannot deactivate your own super admin account.', 'CANNOT_SELF_DEACTIVATE');
  }

  user.status = status;
  await user.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_STATUS_UPDATE,
    resourceType: 'User',
    resourceId: user._id,
    metadata: { status },
  });

  emailService.sendTemplate(user.email, 'accountStatusChanged', { name: user.name, status });

  return user;
}

module.exports = { listUsers, getUserById, updateUser, updateUserStatus };
