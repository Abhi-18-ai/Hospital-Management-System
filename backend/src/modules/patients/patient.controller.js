'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const patientService = require('./patient.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(req.body, req);
  new ApiResponse(201, patient, 'Patient created successfully.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await patientService.listPatients(req.query, pagination);
  new ApiResponse(200, items, 'Patients retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id);
  new ApiResponse(200, patient, 'Patient retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body, req);
  new ApiResponse(200, patient, 'Patient updated successfully.').send(res);
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await patientService.getPatientHistory(req.params.id);
  new ApiResponse(200, history, 'Patient history retrieved successfully.').send(res);
});

const getAppointments = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await patientService.getPatientAppointments(req.params.id, pagination);
  new ApiResponse(200, items, 'Patient appointments retrieved successfully.', buildMeta({ ...pagination, total })).send(
    res
  );
});

module.exports = { create, list, getById, update, getHistory, getAppointments };
