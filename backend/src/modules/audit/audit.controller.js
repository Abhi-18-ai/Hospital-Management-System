'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const auditService = require('./audit.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const search = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await auditService.search(req.query, pagination);
  new ApiResponse(200, items, 'Audit logs retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

module.exports = { search };
