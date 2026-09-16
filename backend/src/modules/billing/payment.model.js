'use strict';

const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../../utils/constants');

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: Object.values(PAYMENT_METHOD), required: true },
    reference: { type: String, trim: true, default: '' },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.SUCCESS, index: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paidAt: { type: Date, required: true, default: Date.now },
    refundReason: { type: String, trim: true, maxlength: 500, default: null },
    refundedAt: { type: Date, default: null },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ invoiceId: 1, paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
