'use strict';

const mongoose = require('mongoose');
const { MEDICINE_STATUS } = require('../../utils/constants');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, index: true },
    genericName: { type: String, trim: true, maxlength: 200, default: '' },
    category: { type: String, trim: true, maxlength: 100, default: '' },
    unit: { type: String, required: true, trim: true, maxlength: 30 }, // e.g. "tablet", "ml", "vial"
    reorderLevel: { type: Number, min: 0, default: 10 },
    status: { type: String, enum: Object.values(MEDICINE_STATUS), default: MEDICINE_STATUS.ACTIVE, index: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
