'use strict';

const mongoose = require('mongoose');
const { PRESCRIPTION_STATUS } = require('../../utils/constants');

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true, maxlength: 200 },
    dosage: { type: String, required: true, trim: true, maxlength: 100 }, // e.g. "500mg"
    frequency: { type: String, required: true, trim: true, maxlength: 100 }, // e.g. "twice daily"
    durationDays: { type: Number, required: true, min: 1 },
    instructions: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    medicalRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', default: null },
    items: {
      type: [prescriptionItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'A prescription must contain at least one item.'],
    },
    status: { type: String, enum: Object.values(PRESCRIPTION_STATUS), default: PRESCRIPTION_STATUS.ACTIVE, index: true },
    issuedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, issuedAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
