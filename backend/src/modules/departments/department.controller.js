'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const departmentService = require('./department.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.body, req);
  new ApiResponse(201, department, 'Department created successfully.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await departmentService.listDepartments(req.query, pagination);
  new ApiResponse(200, items, 'Departments retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  new ApiResponse(200, department, 'Department retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body, req);
  new ApiResponse(200, department, 'Department updated successfully.').send(res);
});

module.exports = { create, list, getById, update };
