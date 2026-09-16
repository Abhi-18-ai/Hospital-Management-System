'use strict';

const mongoose = require('mongoose');
const { LAB_ORDER_STATUS, LAB_ORDER_PRIORITY, LAB_RESULT_STATUS } = require('../../utils/constants');

const labResultSchema = new mongoose.Schema(
  {
    testName: { type: String, required: true, trim: true, maxlength: 200 },
    values: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { "Hemoglobin": "13.5 g/dL" }
    referenceRange: { type: String, trim: true, default: '' },
    interpretation: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: Object.values(LAB_RESULT_STATUS), default: LAB_RESULT_STATUS.PENDING },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    submittedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
  },
  { _id: true }
);

const labOrderSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    tests: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, 'A lab order must include at least one test.'],
    },
    priority: { type: String, enum: Object.values(LAB_ORDER_PRIORITY), default: LAB_ORDER_PRIORITY.ROUTINE },
    status: { type: String, enum: Object.values(LAB_ORDER_STATUS), default: LAB_ORDER_STATUS.ORDERED, index: true },
    results: { type: [labResultSchema], default: [] },
    orderedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

labOrderSchema.index({ patientId: 1, orderedAt: -1 });

module.exports = mongoose.model('LabOrder', labOrderSchema);
