'use strict';

const Doctor = require('./doctor.model');
const User = require('../users/user.model');
const Department = require('../departments/department.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS, ROLES } = require('../../utils/constants');

async function createDoctor(payload, req) {
  const [user, department, existingDoctorProfile] = await Promise.all([
    User.findById(payload.userId),
    Department.findById(payload.departmentId),
    Doctor.findOne({ userId: payload.userId }),
  ]);

  if (!user) throw ApiError.notFound('Linked user account not found.', 'USER_NOT_FOUND');
  if (user.role !== ROLES.DOCTOR) {
    throw ApiError.badRequest('Linked user account must have the doctor role.', 'INVALID_USER_ROLE');
  }
  if (!department) throw ApiError.notFound('Department not found.', 'DEPARTMENT_NOT_FOUND');
  if (existingDoctorProfile) {
    throw ApiError.conflict('A doctor profile already exists for this user.', 'DOCTOR_PROFILE_EXISTS');
  }

  const licenseTaken = await Doctor.findOne({ licenseNumber: payload.licenseNumber });
  if (licenseTaken) {
    throw ApiError.conflict('This license number is already registered.', 'LICENSE_ALREADY_REGISTERED');
  }

  const doctor = await Doctor.create(payload);

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.DOCTOR_CREATE,
    resourceType: 'Doctor',
    resourceId: doctor._id,
  });

  return doctor;
}

async function listDoctors(filters, { page, limit, skip }) {
  const query = {};
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.specialization) query.specialization = new RegExp(filters.specialization, 'i');
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ firstName: regex }, { lastName: regex }, { specialization: regex }];
  }

  const [items, total] = await Promise.all([
    Doctor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('departmentId', 'name code'),
    Doctor.countDocuments(query),
  ]);

  return { items, total };
}

async function getDoctorById(id) {
  const doctor = await Doctor.findById(id).populate('departmentId', 'name code');
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');
  return doctor;
}

async function updateDoctor(id, updates, req) {
  const doctor = await getDoctorById(id);

  if (updates.departmentId) {
    const department = await Department.findById(updates.departmentId);
    if (!department) throw ApiError.notFound('Department not found.', 'DEPARTMENT_NOT_FOUND');
  }

  Object.assign(doctor, updates);
  await doctor.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.DOCTOR_UPDATE,
    resourceType: 'Doctor',
    resourceId: doctor._id,
    metadata: { updates },
  });

  return doctor;
}

/**
 * Computes availability for a given date by combining the doctor's weekly
 * schedule template with existing appointment bookings on that date.
 */
async function getAvailability(id, dateString) {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw ApiError.notFound('Doctor not found.', 'DOCTOR_NOT_FOUND');

  const Appointment = require('../appointments/appointment.model');
  const { APPOINTMENT_STATUS } = require('../../utils/constants');

  const date = new Date(dateString);
  const dayOfWeek = date.getUTCDay();
  const daySlots = doctor.schedule.filter((slot) => slot.dayOfWeek === dayOfWeek);

  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctorId: id,
    startAt: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
  })
    .select('startAt endAt status')
    .sort({ startAt: 1 });

  return {
    doctorId: id,
    date: dayStart.toISOString().slice(0, 10),
    scheduleTemplate: daySlots,
    bookedSlots: bookedAppointments,
  };
}

async function updateSchedule(id, schedule, req) {
  const doctor = await getDoctorById(id);
  doctor.schedule = schedule;
  await doctor.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.DOCTOR_UPDATE,
    resourceType: 'Doctor',
    resourceId: doctor._id,
    metadata: { scheduleUpdated: true },
  });

  return doctor;
}

module.exports = { createDoctor, listDoctors, getDoctorById, updateDoctor, getAvailability, updateSchedule };
