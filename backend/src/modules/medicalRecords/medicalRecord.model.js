'use strict';

const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    temperatureC: { type: Number, default: null },
    heartRateBpm: { type: Number, default: null },
    bloodPressure: { type: String, default: null }, // e.g. "120/80"
    respiratoryRate: { type: Number, default: null },
    spo2: { type: Number, default: null },
    heightCm: { type: Number, default: null },
    weightKg: { type: Number, default: null },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    encounterAt: { type: Date, required: true, default: Date.now },
    chiefComplaint: { type: String, trim: true, maxlength: 500, default: '' },
    diagnoses: { type: [String], default: [] },
    vitals: { type: vitalsSchema, default: () => ({}) },
    notes: { type: String, trim: true, maxlength: 5000, default: '' },
    attachments: { type: [String], default: [] }, // references/URLs to stored documents
    lockedAt: { type: Date, default: null }, // once locked, clinically finalized records restrict edits
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patientId: 1, encounterAt: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
