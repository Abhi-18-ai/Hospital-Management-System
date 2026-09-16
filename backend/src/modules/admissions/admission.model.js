'use strict';

const mongoose = require('mongoose');
const { ADMISSION_STATUS } = require('../../utils/constants');

const bedAssignmentSchema = new mongoose.Schema(
  {
    ward: { type: String, required: true, trim: true, maxlength: 60 },
    room: { type: String, required: true, trim: true, maxlength: 30 },
    bed: { type: String, required: true, trim: true, maxlength: 30 },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const admissionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    ward: { type: String, required: true, trim: true, maxlength: 60 },
    room: { type: String, required: true, trim: true, maxlength: 30 },
    bed: { type: String, required: true, trim: true, maxlength: 30 },
    reason: { type: String, trim: true, maxlength: 500, default: '' },
    transferHistory: { type: [bedAssignmentSchema], default: [] },
    admittedAt: { type: Date, required: true, default: Date.now },
    dischargedAt: { type: Date, default: null },
    dischargeSummary: { type: String, trim: true, maxlength: 3000, default: null },
    status: { type: String, enum: Object.values(ADMISSION_STATUS), default: ADMISSION_STATUS.ADMITTED, index: true },
  },
  { timestamps: true }
);

admissionSchema.index({ patientId: 1, admittedAt: -1 });
// A bed can only be actively occupied by one admission at a time.
admissionSchema.index(
  { ward: 1, room: 1, bed: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'admitted' } }
);

module.exports = mongoose.model('Admission', admissionSchema);
