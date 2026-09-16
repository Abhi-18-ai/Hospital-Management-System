'use strict';

const AuditLog = require('./audit.model');
const logger = require('../../config/logger');

/**
 * Records an immutable audit event. Audit writes must never block or fail
 * the primary business operation, so failures are logged but swallowed.
 *
 * @param {object} params
 * @param {object} [params.req] Express request (used to derive actor/context)
 * @param {string} params.action One of AUDIT_ACTIONS
 * @param {string} params.resourceType e.g. 'Patient', 'Appointment'
 * @param {string} [params.resourceId]
 * @param {object} [params.metadata]
 */
async function record({ req, action, resourceType, resourceId = null, metadata = {} }) {
  try {
    await AuditLog.create({
      actorId: req?.user?.id || null,
      actorRole: req?.user?.role || null,
      action,
      resourceType,
      resourceId,
      metadata,
      requestId: req?.requestId || null,
      ip: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (err) {
    logger.error(`Failed to write audit log for action=${action}: ${err.message}`);
  }
}

async function search(filters, { page, limit, skip }) {
  const query = {};
  if (filters.action) query.action = filters.action;
  if (filters.resourceType) query.resourceType = filters.resourceType;
  if (filters.resourceId) query.resourceId = filters.resourceId;
  if (filters.actorId) query.actorId = filters.actorId;
  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = new Date(filters.from);
    if (filters.to) query.createdAt.$lte = new Date(filters.to);
  }

  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return { items, total };
}

module.exports = { record, search };
