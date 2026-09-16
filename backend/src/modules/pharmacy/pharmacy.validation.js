'use strict';

const Joi = require('joi');
const { objectIdRequired, paginationQuery } = require('../../utils/joiCommon');
const { MEDICINE_STATUS } = require('../../utils/constants');

const createMedicine = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    genericName: Joi.string().trim().max(200).allow(''),
    category: Joi.string().trim().max(100).allow(''),
    unit: Joi.string().trim().min(1).max(30).required(),
    reorderLevel: Joi.number().min(0),
  }),
};

const searchMedicines = {
  query: Joi.object({
    ...paginationQuery,
    search: Joi.string().trim().max(120),
    category: Joi.string().trim().max(100),
    status: Joi.string().valid(...Object.values(MEDICINE_STATUS)),
  }),
};

const createBatch = {
  body: Joi.object({
    medicineId: objectIdRequired,
    batchNo: Joi.string().trim().min(1).max(60).required(),
    expiryDate: Joi.date().iso().greater('now').required(),
    quantity: Joi.number().integer().min(1).required(),
    unitCost: Joi.number().min(0).required(),
  }),
};

const stockView = {
  query: Joi.object({
    ...paginationQuery,
    medicineId: Joi.string(),
  }),
};

const dispenseMedicine = {
  body: Joi.object({
    patientId: objectIdRequired,
    prescriptionId: Joi.string().trim().allow(null),
    items: Joi.array()
      .items(
        Joi.object({
          medicineId: objectIdRequired,
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
  }),
};

const lowStock = {
  query: Joi.object({ ...paginationQuery }),
};

module.exports = { createMedicine, searchMedicines, createBatch, stockView, dispenseMedicine, lowStock };
