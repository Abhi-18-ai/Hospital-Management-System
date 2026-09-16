'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const admissionService = require('./admission.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const admit = asyncHandler(async (req, res) => {
  const admission = await admissionService.admitPatient(req.body, req);
  new ApiResponse(201, admission, 'Patient admitted successfully.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await admissionService.listAdmissions(req.query, pagination, req);
  new ApiResponse(200, items, 'Admissions retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const admission = await admissionService.getAdmissionById(req.params.id, req);
  new ApiResponse(200, admission, 'Admission retrieved successfully.').send(res);
});

const transfer = asyncHandler(async (req, res) => {
  const admission = await admissionService.transferAdmission(req.params.id, req.body, req);
  new ApiResponse(200, admission, 'Patient transferred successfully.').send(res);
});

const discharge = asyncHandler(async (req, res) => {
  const admission = await admissionService.dischargePatient(req.params.id, req.body.dischargeSummary, req);
  new ApiResponse(200, admission, 'Patient discharged successfully.').send(res);
});

const bedsAvailability = asyncHandler(async (req, res) => {
  const availability = await admissionService.getBedsAvailability(req.query.ward);
  new ApiResponse(200, availability, 'Bed availability retrieved successfully.').send(res);
});

module.exports = { admit, list, getById, transfer, discharge, bedsAvailability };
