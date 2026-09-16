'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const appointmentService = require('./appointment.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.body, req);
  new ApiResponse(201, appointment, 'Appointment booked successfully.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await appointmentService.listAppointments(req.query, pagination, req);
  new ApiResponse(200, items, 'Appointments retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id, req);
  new ApiResponse(200, appointment, 'Appointment retrieved successfully.').send(res);
});

const update = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointment(req.params.id, req.body, req);
  new ApiResponse(200, appointment, 'Appointment updated successfully.').send(res);
});

const cancel = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.params.id, req.body.reason, req);
  new ApiResponse(200, appointment, 'Appointment cancelled successfully.').send(res);
});

const reschedule = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    req.body.startAt,
    req.body.endAt,
    req
  );
  new ApiResponse(200, appointment, 'Appointment rescheduled successfully.').send(res);
});

const checkIn = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.checkInAppointment(req.params.id, req);
  new ApiResponse(200, appointment, 'Patient checked in successfully.').send(res);
});

module.exports = { create, list, getById, update, cancel, reschedule, checkIn };
