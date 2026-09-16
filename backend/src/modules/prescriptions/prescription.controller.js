'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const prescriptionService = require('./prescription.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.body, req);
  new ApiResponse(201, prescription, 'Prescription created successfully.').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);
  new ApiResponse(200, prescription, 'Prescription retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.updatePrescription(req.params.id, req.body, req);
  new ApiResponse(200, prescription, 'Prescription updated successfully.').send(res);
});

const listForPatient = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await prescriptionService.listPatientPrescriptions(req.params.patientId, pagination);
  new ApiResponse(200, items, 'Patient prescriptions retrieved successfully.', buildMeta({ ...pagination, total })).send(
    res
  );
});

module.exports = { create, getById, update, listForPatient };
