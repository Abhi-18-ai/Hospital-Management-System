'use strict';

const mongoose = require('mongoose');

const inventoryBatchSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    batchNo: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

inventoryBatchSchema.index({ medicineId: 1, batchNo: 1 }, { unique: true });
inventoryBatchSchema.index({ medicineId: 1, expiryDate: 1 });

module.exports = mongoose.model('InventoryBatch', inventoryBatchSchema);
