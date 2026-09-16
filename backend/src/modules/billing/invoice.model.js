'use strict';

const mongoose = require('mongoose');
const { INVOICE_STATUS } = require('../../utils/constants');

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 300 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }, // quantity * unitPrice
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'An invoice must contain at least one line item.'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: Object.values(INVOICE_STATUS), default: INVOICE_STATUS.ISSUED, index: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

invoiceSchema.index({ patientId: 1, issuedAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
