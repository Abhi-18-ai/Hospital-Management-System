'use strict';

const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.SCHEDULED,
      index: true,
    },
    reason: { type: String, trim: true, maxlength: 500, default: '' },
    checkedInAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, trim: true, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, startAt: 1 });
appointmentSchema.index({ patientId: 1, startAt: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
