'use strict';

const mongoose = require('mongoose');
const Invoice = require('./invoice.model');
const Payment = require('./payment.model');
const Patient = require('../patients/patient.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const notificationService = require('../notifications/notification.service');
const emailService = require('../notifications/email.service');
const logger = require('../../config/logger');
const { generateCode } = require('../../utils/idHelpers');
const {
  AUDIT_ACTIONS,
  INVOICE_STATUS,
  PAYMENT_STATUS,
  NOTIFICATION_TYPE,
  ROLES,
} = require('../../utils/constants');

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

async function createInvoice(payload, req) {
  const patient = await Patient.findById(payload.patientId);
  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');

  const items = payload.items.map((item) => ({
    ...item,
    quantity: item.quantity || 1,
    amount: roundCurrency((item.quantity || 1) * item.unitPrice),
  }));

  const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.amount, 0));
  const discount = roundCurrency(payload.discount || 0);
  const tax = roundCurrency(payload.tax || 0);
  const total = roundCurrency(subtotal - discount + tax);

  if (total < 0) {
    throw ApiError.badRequest('Invoice total cannot be negative. Check discount and tax values.', 'INVALID_INVOICE_TOTAL');
  }

  let invoiceNumber = generateCode('INV');
  // eslint-disable-next-line no-await-in-loop
  while (await Invoice.exists({ invoiceNumber })) {
    invoiceNumber = generateCode('INV');
  }

  const invoice = await Invoice.create({
    invoiceNumber,
    patientId: payload.patientId,
    items,
    subtotal,
    discount,
    tax,
    total,
    notes: payload.notes || '',
    issuedBy: req.user.id,
  });

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.INVOICE_CREATE,
    resourceType: 'Invoice',
    resourceId: invoice._id,
  });

  if (patient.userId) {
    await notificationService.notify({
      userId: patient.userId,
      type: NOTIFICATION_TYPE.INVOICE_ISSUED,
      title: 'New invoice issued',
      message: `Invoice ${invoice.invoiceNumber} for ${invoice.total} has been issued.`,
      metadata: { invoiceId: invoice._id },
    });
  }

  if (patient.contact?.email) {
    emailService.sendTemplate(patient.contact.email, 'invoiceIssued', {
      name: `${patient.firstName} ${patient.lastName}`,
      invoiceNumber: invoice.invoiceNumber,
      total: `₹${invoice.total.toFixed(2)}`,
    });
  }

  return invoice;
}

async function listInvoices(filters, { page, limit, skip }) {
  const query = {};
  if (filters.patientId) query.patientId = filters.patientId;
  if (filters.status) query.status = filters.status;
  if (filters.from || filters.to) {
    query.issuedAt = {};
    if (filters.from) query.issuedAt.$gte = new Date(filters.from);
    if (filters.to) query.issuedAt.$lte = new Date(filters.to);
  }

  const [items, total] = await Promise.all([
    Invoice.find(query)
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName mrn'),
    Invoice.countDocuments(query),
  ]);

  return { items, total };
}

async function getInvoiceById(id) {
  const invoice = await Invoice.findById(id).populate('patientId', 'firstName lastName mrn userId');
  if (!invoice) throw ApiError.notFound('Invoice not found.', 'INVOICE_NOT_FOUND');

  const payments = await Payment.find({ invoiceId: id }).sort({ paidAt: -1 });
  return { invoice, payments };
}

async function recordPayment(invoiceId, payload, req) {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const invoice = await Invoice.findById(invoiceId).session(session);
      if (!invoice) throw ApiError.notFound('Invoice not found.', 'INVOICE_NOT_FOUND');

      if ([INVOICE_STATUS.CANCELLED, INVOICE_STATUS.PAID, INVOICE_STATUS.REFUNDED].includes(invoice.status)) {
        throw ApiError.conflict(`Cannot record payment for an invoice with status '${invoice.status}'.`, 'INVOICE_NOT_PAYABLE');
      }

      const outstanding = roundCurrency(invoice.total - invoice.amountPaid);
      if (payload.amount > outstanding + 0.01) {
        throw ApiError.badRequest(
          `Payment amount (${payload.amount}) exceeds the outstanding balance (${outstanding}).`,
          'PAYMENT_EXCEEDS_BALANCE'
        );
      }

      const [payment] = await Payment.create(
        [
          {
            invoiceId,
            amount: payload.amount,
            method: payload.method,
            reference: payload.reference || '',
            paidAt: payload.paidAt || new Date(),
            recordedBy: req.user.id,
          },
        ],
        { session }
      );

      invoice.amountPaid = roundCurrency(invoice.amountPaid + payload.amount);
      invoice.status =
        invoice.amountPaid >= invoice.total ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;
      await invoice.save({ session });

      result = { invoice, payment };
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Payment recording transaction failed: ${err.message}`);
    throw ApiError.internal('Failed to record payment. Please try again.', 'PAYMENT_RECORDING_FAILED');
  } finally {
    await session.endSession();
  }

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.PAYMENT_RECORD,
    resourceType: 'Payment',
    resourceId: result.payment._id,
    metadata: { invoiceId, amount: payload.amount },
  });

  return result;
}

async function refundPayment(paymentId, reason, req) {
  // Refunds are financially sensitive: restrict to accountants/admins at the
  // service layer as a defense-in-depth measure beyond route-level RBAC.
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT];
  if (!allowedRoles.includes(req.user.role)) {
    throw ApiError.forbidden('You are not authorized to process refunds.', 'REFUND_NOT_AUTHORIZED');
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) throw ApiError.notFound('Payment not found.', 'PAYMENT_NOT_FOUND');

      if (payment.status === PAYMENT_STATUS.REFUNDED) {
        throw ApiError.conflict('This payment has already been refunded.', 'PAYMENT_ALREADY_REFUNDED');
      }

      const invoice = await Invoice.findById(payment.invoiceId).session(session);
      if (!invoice) throw ApiError.notFound('Associated invoice not found.', 'INVOICE_NOT_FOUND');

      payment.status = PAYMENT_STATUS.REFUNDED;
      payment.refundReason = reason;
      payment.refundedAt = new Date();
      payment.refundedBy = req.user.id;
      await payment.save({ session });

      invoice.amountPaid = roundCurrency(Math.max(invoice.amountPaid - payment.amount, 0));
      invoice.status = invoice.amountPaid > 0 ? INVOICE_STATUS.PARTIALLY_PAID : INVOICE_STATUS.REFUNDED;
      await invoice.save({ session });

      result = { invoice, payment };
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Refund transaction failed: ${err.message}`);
    throw ApiError.internal('Failed to process refund. Please try again.', 'REFUND_FAILED');
  } finally {
    await session.endSession();
  }

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.PAYMENT_REFUND,
    resourceType: 'Payment',
    resourceId: result.payment._id,
    metadata: { reason },
  });

  return result;
}

module.exports = { createInvoice, listInvoices, getInvoiceById, recordPayment, refundPayment };
