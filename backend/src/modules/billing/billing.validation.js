'use strict';

const Joi = require('joi');
const { objectIdRequired, objectId, paginationQuery } = require('../../utils/joiCommon');
const { INVOICE_STATUS, PAYMENT_METHOD } = require('../../utils/constants');

const invoiceItem = Joi.object({
  description: Joi.string().trim().min(1).max(300).required(),
  quantity: Joi.number().integer().min(1).default(1),
  unitPrice: Joi.number().min(0).required(),
});

const createInvoice = {
  body: Joi.object({
    patientId: objectIdRequired,
    items: Joi.array().items(invoiceItem).min(1).required(),
    discount: Joi.number().min(0).default(0),
    tax: Joi.number().min(0).default(0),
    notes: Joi.string().trim().max(1000).allow(''),
  }),
};

const listInvoices = {
  query: Joi.object({
    ...paginationQuery,
    patientId: objectId,
    status: Joi.string().valid(...Object.values(INVOICE_STATUS)),
    from: Joi.date().iso(),
    to: Joi.date().iso(),
  }),
};

const getInvoice = { params: Joi.object({ id: objectIdRequired }) };

const recordPayment = {
  params: Joi.object({ id: objectIdRequired }),
  body: Joi.object({
    amount: Joi.number().greater(0).required(),
    method: Joi.string()
      .valid(...Object.values(PAYMENT_METHOD))
      .required(),
    reference: Joi.string().trim().max(200).allow(''),
    paidAt: Joi.date().iso(),
  }),
};

const refundPayment = {
  params: Joi.object({ id: objectIdRequired }), // payment id
  body: Joi.object({
    reason: Joi.string().trim().min(1).max(500).required(),
  }),
};

module.exports = { createInvoice, listInvoices, getInvoice, recordPayment, refundPayment };
