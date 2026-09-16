'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const labService = require('./laboratory.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const order = await labService.createLabOrder(req.body, req);
  new ApiResponse(201, order, 'Lab order created successfully.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await labService.listLabOrders(req.query, pagination, req);
  new ApiResponse(200, items, 'Lab orders retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const order = await labService.getLabOrderById(req.params.id, req);
  new ApiResponse(200, order, 'Lab order retrieved successfully.').send(res);
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await labService.updateLabOrderStatus(req.params.id, req.body.status, req);
  new ApiResponse(200, order, 'Lab order status updated successfully.').send(res);
});

const submitResults = asyncHandler(async (req, res) => {
  const order = await labService.submitResults(req.params.id, req.body.results, req);
  new ApiResponse(200, order, 'Lab results submitted successfully.').send(res);
});

const verifyResult = asyncHandler(async (req, res) => {
  const order = await labService.verifyResult(req.params.id, req.body.decision, req.body.comment, req);
  new ApiResponse(200, order, 'Lab result decision recorded successfully.').send(res);
});

module.exports = { create, list, getById, updateStatus, submitResults, verifyResult };
