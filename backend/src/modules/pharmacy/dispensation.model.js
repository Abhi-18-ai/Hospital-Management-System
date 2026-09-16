'use strict';

const mongoose = require('mongoose');

const dispensationItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryBatch', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const dispensationSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', default: null },
    pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [dispensationItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'A dispensation must include at least one item.'],
    },
    dispensedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispensation', dispensationSchema);
