'use strict';

const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sunday .. 6=Saturday
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    specialization: { type: String, trim: true, required: true, maxlength: 150 },
    licenseNumber: { type: String, trim: true, required: true, unique: true },
    consultationFee: { type: Number, min: 0, default: 0 },
    schedule: { type: [scheduleSlotSchema], default: [] },
    status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ firstName: 'text', lastName: 'text', specialization: 'text' });

doctorSchema.virtual('fullName').get(function fullName() {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

doctorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);
