'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const doctorService = require('./doctor.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body, req);
  new ApiResponse(201, doctor, 'Doctor profile created successfully.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await doctorService.listDoctors(req.query, pagination);
  new ApiResponse(200, items, 'Doctors retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  new ApiResponse(200, doctor, 'Doctor retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body, req);
  new ApiResponse(200, doctor, 'Doctor updated successfully.').send(res);
});

const getAvailability = asyncHandler(async (req, res) => {
  const availability = await doctorService.getAvailability(req.params.id, req.query.date);
  new ApiResponse(200, availability, 'Doctor availability retrieved successfully.').send(res);
});

const updateSchedule = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateSchedule(req.params.id, req.body.schedule, req);
  new ApiResponse(200, doctor, 'Doctor schedule updated successfully.').send(res);
});

module.exports = { create, list, getById, update, getAvailability, updateSchedule };
