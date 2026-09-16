'use strict';

const mongoose = require('mongoose');
const Medicine = require('./medicine.model');
const InventoryBatch = require('./inventoryBatch.model');
const Dispensation = require('./dispensation.model');
const Patient = require('../patients/patient.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const emailService = require('../notifications/email.service');
const logger = require('../../config/logger');
const { AUDIT_ACTIONS, ROLES } = require('../../utils/constants');

async function createMedicine(payload, req) {
  const existing = await Medicine.findOne({ name: payload.name });
  if (existing) {
    throw ApiError.conflict('A medicine with this name already exists.', 'MEDICINE_ALREADY_EXISTS');
  }

  const medicine = await Medicine.create(payload);

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.MEDICINE_CREATE,
    resourceType: 'Medicine',
    resourceId: medicine._id,
  });

  return medicine;
}

async function searchMedicines(filters, { page, limit, skip }) {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = new RegExp(filters.category, 'i');
  if (filters.search) {
    const regex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { genericName: regex }];
  }

  const [items, total] = await Promise.all([
    Medicine.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Medicine.countDocuments(query),
  ]);

  return { items, total };
}

async function createBatch(payload, req) {
  const medicine = await Medicine.findById(payload.medicineId);
  if (!medicine) throw ApiError.notFound('Medicine not found.', 'MEDICINE_NOT_FOUND');

  const existingBatch = await InventoryBatch.findOne({
    medicineId: payload.medicineId,
    batchNo: payload.batchNo,
  });
  if (existingBatch) {
    throw ApiError.conflict('This batch number already exists for the medicine.', 'BATCH_ALREADY_EXISTS');
  }

  const batch = await InventoryBatch.create(payload);

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.BATCH_CREATE,
    resourceType: 'InventoryBatch',
    resourceId: batch._id,
  });

  return batch;
}

async function getStockView(filters, { page, limit, skip }) {
  const query = { quantity: { $gt: 0 } };
  if (filters.medicineId) query.medicineId = filters.medicineId;

  const [items, total] = await Promise.all([
    InventoryBatch.find(query)
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('medicineId', 'name genericName unit'),
    InventoryBatch.countDocuments(query),
  ]);

  return { items, total };
}

async function getLowStockMedicines({ page, limit, skip }) {
  // Aggregate total remaining quantity per medicine across all non-expired batches,
  // then compare against each medicine's configured reorderLevel.
  const aggregation = await InventoryBatch.aggregate([
    { $match: { expiryDate: { $gt: new Date() } } },
    { $group: { _id: '$medicineId', totalQuantity: { $sum: '$quantity' } } },
  ]);

  const stockMap = new Map(aggregation.map((entry) => [entry._id.toString(), entry.totalQuantity]));

  const medicines = await Medicine.find({ status: 'active' }).sort({ name: 1 });

  const lowStockItems = medicines
    .map((medicine) => ({
      medicine,
      totalQuantity: stockMap.get(medicine._id.toString()) || 0,
    }))
    .filter((entry) => entry.totalQuantity <= entry.medicine.reorderLevel);

  const total = lowStockItems.length;
  const items = lowStockItems.slice(skip, skip + limit);

  return { items, total };
}

/**
 * Dispenses medicine to a patient using FEFO (first-expiry-first-out) batch
 * allocation. Runs inside a MongoDB transaction so partial stock deductions
 * can never occur if a later item in the request fails validation.
 * Requires MongoDB to be running as a replica set (standard for production).
 */
async function dispenseMedicine(payload, req) {
  const patient = await Patient.findById(payload.patientId);
  if (!patient) throw ApiError.notFound('Patient not found.', 'PATIENT_NOT_FOUND');

  const session = await mongoose.startSession();
  let dispensation;

  try {
    await session.withTransaction(async () => {
      const dispensationItems = [];

      for (const item of payload.items) {
        const medicine = await Medicine.findById(item.medicineId).session(session);
        if (!medicine) {
          throw ApiError.notFound(`Medicine not found: ${item.medicineId}`, 'MEDICINE_NOT_FOUND');
        }

        let remaining = item.quantity;
        const batches = await InventoryBatch.find({
          medicineId: item.medicineId,
          quantity: { $gt: 0 },
          expiryDate: { $gt: new Date() },
        })
          .sort({ expiryDate: 1 })
          .session(session);

        for (const batch of batches) {
          if (remaining <= 0) break;
          const deduction = Math.min(batch.quantity, remaining);
          batch.quantity -= deduction;
          remaining -= deduction;
          await batch.save({ session });
          dispensationItems.push({ medicineId: medicine._id, batchId: batch._id, quantity: deduction });
        }

        if (remaining > 0) {
          throw ApiError.conflict(
            `Insufficient stock for medicine '${medicine.name}'. Short by ${remaining} ${medicine.unit}(s).`,
            'INSUFFICIENT_STOCK'
          );
        }
      }

      const [created] = await Dispensation.create(
        [
          {
            patientId: payload.patientId,
            prescriptionId: payload.prescriptionId || null,
            pharmacistId: req.user.id,
            items: dispensationItems,
          },
        ],
        { session }
      );
      dispensation = created;
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Dispensation transaction failed: ${err.message}`);
    throw ApiError.internal('Failed to process dispensation. Please try again.', 'DISPENSATION_FAILED');
  } finally {
    await session.endSession();
  }

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.MEDICINE_DISPENSE,
    resourceType: 'Dispensation',
    resourceId: dispensation._id,
  });

  // Post-transaction, best-effort: check whether any dispensed medicine has
  // now dropped to or below its reorder level, and alert pharmacy staff if so.
  // Deliberately outside the transaction and never allowed to affect the
  // dispensation's success -- this is a proactive alert, not a business rule.
  const dispensedMedicineIds = [...new Set(payload.items.map((item) => item.medicineId))];
  checkAndAlertLowStock(dispensedMedicineIds).catch((err) =>
    logger.error(`Low-stock alert check failed: ${err.message}`)
  );

  return dispensation;
}

async function checkAndAlertLowStock(medicineIds) {
  const aggregation = await InventoryBatch.aggregate([
    { $match: { medicineId: { $in: medicineIds }, expiryDate: { $gt: new Date() } } },
    { $group: { _id: '$medicineId', totalQuantity: { $sum: '$quantity' } } },
  ]);
  const stockMap = new Map(aggregation.map((entry) => [entry._id.toString(), entry.totalQuantity]));

  const lowStockMedicines = [];
  for (const medicineId of medicineIds) {
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) continue;
    const remaining = stockMap.get(medicineId.toString()) || 0;
    if (remaining <= medicine.reorderLevel) {
      lowStockMedicines.push({ medicine, remaining });
    }
  }

  if (lowStockMedicines.length === 0) return;

  const recipients = await User.find({
    role: { $in: [ROLES.PHARMACIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN] },
    status: 'active',
  }).select('email');

  for (const { medicine, remaining } of lowStockMedicines) {
    for (const recipient of recipients) {
      emailService.sendTemplate(recipient.email, 'lowStockAlert', {
        medicineName: medicine.name,
        remaining,
        reorderLevel: medicine.reorderLevel,
        unit: medicine.unit,
      });
    }
  }
}

module.exports = {
  createMedicine,
  searchMedicines,
  createBatch,
  getStockView,
  getLowStockMedicines,
  dispenseMedicine,
};
