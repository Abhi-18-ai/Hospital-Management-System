'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const medicalRecordService = require('./medicalRecord.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const record = await medicalRecordService.createMedicalRecord(req.body, req);
  new ApiResponse(201, record, 'Medical record created successfully.').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const record = await medicalRecordService.getMedicalRecordById(req.params.id);
  new ApiResponse(200, record, 'Medical record retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const record = await medicalRecordService.updateMedicalRecord(req.params.id, req.body, req);
  new ApiResponse(200, record, 'Medical record updated successfully.').send(res);
});

const listForPatient = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await medicalRecordService.listPatientMedicalRecords(req.params.patientId, pagination);
  new ApiResponse(200, items, 'Patient medical records retrieved successfully.', buildMeta({ ...pagination, total })).send(
    res
  );
});

module.exports = { create, getById, update, listForPatient };
