'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const userService = require('./user.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await userService.listUsers(req.query, pagination);
  new ApiResponse(200, items, 'Users retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  new ApiResponse(200, user.toSafeJSON(), 'User retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req);
  new ApiResponse(200, user.toSafeJSON(), 'User updated successfully.').send(res);
});

const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.status, req);
  new ApiResponse(200, user.toSafeJSON(), 'User status updated successfully.').send(res);
});

module.exports = { list, getById, update, updateStatus };
