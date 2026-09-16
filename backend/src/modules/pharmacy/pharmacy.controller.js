'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const pharmacyService = require('./pharmacy.service');
const { getPagination, buildMeta } = require('../../utils/pagination');

const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await pharmacyService.createMedicine(req.body, req);
  new ApiResponse(201, medicine, 'Medicine created successfully.').send(res);
});

const searchMedicines = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await pharmacyService.searchMedicines(req.query, pagination);
  new ApiResponse(200, items, 'Medicines retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const createBatch = asyncHandler(async (req, res) => {
  const batch = await pharmacyService.createBatch(req.body, req);
  new ApiResponse(201, batch, 'Stock batch created successfully.').send(res);
});

const stockView = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await pharmacyService.getStockView(req.query, pagination);
  new ApiResponse(200, items, 'Stock retrieved successfully.', buildMeta({ ...pagination, total })).send(res);
});

const dispense = asyncHandler(async (req, res) => {
  const dispensation = await pharmacyService.dispenseMedicine(req.body, req);
  new ApiResponse(201, dispensation, 'Medicine dispensed successfully.').send(res);
});

const lowStock = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, total } = await pharmacyService.getLowStockMedicines(pagination);
  new ApiResponse(200, items, 'Low-stock medicines retrieved successfully.', buildMeta({ ...pagination, total })).send(
    res
  );
});

module.exports = { createMedicine, searchMedicines, createBatch, stockView, dispense, lowStock };
