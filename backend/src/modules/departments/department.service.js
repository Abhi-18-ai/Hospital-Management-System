'use strict';

const Department = require('./department.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS } = require('../../utils/constants');

async function createDepartment(payload, req) {
  const existing = await Department.findOne({
    $or: [{ name: payload.name }, { code: payload.code.toUpperCase() }],
  });
  if (existing) {
    throw ApiError.conflict('A department with this name or code already exists.', 'DEPARTMENT_ALREADY_EXISTS');
  }

  const department = await Department.create(payload);

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.DEPARTMENT_CREATE,
    resourceType: 'Department',
    resourceId: department._id,
  });

  return department;
}

async function listDepartments(filters, { page, limit, skip }) {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { code: regex }];
  }

  const [items, total] = await Promise.all([
    Department.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Department.countDocuments(query),
  ]);

  return { items, total };
}

async function getDepartmentById(id) {
  const department = await Department.findById(id);
  if (!department) throw ApiError.notFound('Department not found.', 'DEPARTMENT_NOT_FOUND');
  return department;
}

async function updateDepartment(id, updates, req) {
  const department = await getDepartmentById(id);

  Object.assign(department, updates);
  await department.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.DEPARTMENT_UPDATE,
    resourceType: 'Department',
    resourceId: department._id,
    metadata: { updates },
  });

  return department;
}

module.exports = { createDepartment, listDepartments, getDepartmentById, updateDepartment };
