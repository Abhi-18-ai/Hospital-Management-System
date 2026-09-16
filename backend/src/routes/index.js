'use strict';

const express = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const patientRoutes = require('../modules/patients/patient.routes');
const patientMedicalRecordRoutes = require('../modules/medicalRecords/patientMedicalRecord.routes');
const patientPrescriptionRoutes = require('../modules/prescriptions/patientPrescription.routes');
const doctorRoutes = require('../modules/doctors/doctor.routes');
const departmentRoutes = require('../modules/departments/department.routes');
const appointmentRoutes = require('../modules/appointments/appointment.routes');
const medicalRecordRoutes = require('../modules/medicalRecords/medicalRecord.routes');
const prescriptionRoutes = require('../modules/prescriptions/prescription.routes');
const laboratoryRoutes = require('../modules/laboratory/laboratory.routes');
const pharmacyRoutes = require('../modules/pharmacy/pharmacy.routes');
const admissionRoutes = require('../modules/admissions/admission.routes');
const bedsRoutes = require('../modules/admissions/beds.routes');
const billingRoutes = require('../modules/billing/billing.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');
const auditRoutes = require('../modules/audit/audit.routes');

const router = express.Router();

// Domain route mounting per the PRD's API Route Catalog (Base URL: /api/v1).
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Patients: nested read routes (medical-records, prescriptions) are mounted
router.use('/patients', patientMedicalRecordRoutes);
router.use('/patients', patientPrescriptionRoutes);
router.use('/patients', patientRoutes);

router.use('/doctors', doctorRoutes);
router.use('/departments', departmentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/lab', laboratoryRoutes);
router.use('/pharmacy', pharmacyRoutes);

// Beds: /beds/availability must be mounted before /admissions/:id-style paths
router.use('/beds', bedsRoutes);
router.use('/admissions', admissionRoutes);

router.use('/billing', billingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);

module.exports = router;
