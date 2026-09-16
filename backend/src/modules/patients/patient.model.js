'use strict';

const mongoose = require('mongoose');
const { PATIENT_STATUS } = require('../../utils/constants');

const patientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    mrn: { type: String, required: true, unique: true, index: true }, // Medical Record Number
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown',
    },
    contact: {
      phone: { type: String, trim: true, required: true },
      email: { type: String, trim: true, lowercase: true, default: null },
      address: { type: String, trim: true, default: '' },
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relationship: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    allergies: { type: [String], default: [] },
    status: { type: String, enum: Object.values(PATIENT_STATUS), default: PATIENT_STATUS.ACTIVE, index: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

patientSchema.index({ firstName: 'text', lastName: 'text', mrn: 'text' });
patientSchema.index({ 'contact.phone': 1 });

patientSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
