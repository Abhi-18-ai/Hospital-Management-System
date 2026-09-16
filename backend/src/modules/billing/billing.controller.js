'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const billingService = require('./billing.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.createInvoice(req.body, req);
  new ApiResponse(201, invoice, 'Invoice created successfully.').send(res);
});

const listInvoices = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await billingService.listInvoices(req.query, pagination);
  new ApiResponse(200, items, 'Invoices retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const data = await billingService.getInvoiceById(req.params.id);
  new ApiResponse(200, data, 'Invoice retrieved successfully.').send(res);
});

const recordPayment = asyncHandler(async (req, res) => {
  const result = await billingService.recordPayment(req.params.id, req.body, req);
  new ApiResponse(201, result, 'Payment recorded successfully.').send(res);
});

const refundPayment = asyncHandler(async (req, res) => {
  const result = await billingService.refundPayment(req.params.id, req.body.reason, req);
  new ApiResponse(200, result, 'Payment refunded successfully.').send(res);
});

module.exports = { createInvoice, listInvoices, getInvoiceById, recordPayment, refundPayment };
