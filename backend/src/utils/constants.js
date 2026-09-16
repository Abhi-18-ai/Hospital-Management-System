'use strict';

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital_admin',
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  ACCOUNTANT: 'accountant',
  PATIENT: 'patient',
});

const ALL_ROLES = Object.values(ROLES);

const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN];

const CLINICAL_ROLES = [ROLES.DOCTOR, ROLES.NURSE];

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
});

const PATIENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DECEASED: 'deceased',
});

const APPOINTMENT_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
});

const PRESCRIPTION_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const LAB_ORDER_STATUS = Object.freeze({
  ORDERED: 'ordered',
  SAMPLE_COLLECTED: 'sample_collected',
  IN_PROGRESS: 'in_progress',
  RESULT_SUBMITTED: 'result_submitted',
  VERIFIED: 'verified',
  CANCELLED: 'cancelled',
});

const LAB_RESULT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

const LAB_ORDER_PRIORITY = Object.freeze({
  ROUTINE: 'routine',
  URGENT: 'urgent',
  STAT: 'stat',
});

const MEDICINE_STATUS = Object.freeze({
  ACTIVE: 'active',
  DISCONTINUED: 'discontinued',
});

const ADMISSION_STATUS = Object.freeze({
  ADMITTED: 'admitted',
  TRANSFERRED: 'transferred',
  DISCHARGED: 'discharged',
});

const INVOICE_STATUS = Object.freeze({
  DRAFT: 'draft',
  ISSUED: 'issued',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
});

const PAYMENT_STATUS = Object.freeze({
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

const PAYMENT_METHOD = Object.freeze({
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  INSURANCE: 'insurance',
  OTHER: 'other',
});

const NOTIFICATION_TYPE = Object.freeze({
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
  LAB_RESULT_READY: 'lab_result_ready',
  PRESCRIPTION_READY: 'prescription_ready',
  INVOICE_ISSUED: 'invoice_issued',
  ADMISSION_UPDATE: 'admission_update',
  GENERAL: 'general',
  SECURITY_ALERT: 'security_alert',
});

const AUDIT_ACTIONS = Object.freeze({
  USER_REGISTER: 'user.register',
  USER_LOGIN: 'user.login',
  USER_LOGIN_FAILED: 'user.login_failed',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_CHANGE: 'user.password_change',
  USER_PASSWORD_RESET_REQUEST: 'user.password_reset_request',
  USER_PASSWORD_RESET_COMPLETE: 'user.password_reset_complete',
  USER_STATUS_UPDATE: 'user.status_update',
  USER_UPDATE: 'user.update',
  PATIENT_CREATE: 'patient.create',
  PATIENT_UPDATE: 'patient.update',
  DOCTOR_CREATE: 'doctor.create',
  DOCTOR_UPDATE: 'doctor.update',
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_UPDATE: 'department.update',
  APPOINTMENT_CREATE: 'appointment.create',
  APPOINTMENT_UPDATE: 'appointment.update',
  APPOINTMENT_CANCEL: 'appointment.cancel',
  APPOINTMENT_RESCHEDULE: 'appointment.reschedule',
  APPOINTMENT_CHECK_IN: 'appointment.check_in',
  MEDICAL_RECORD_CREATE: 'medical_record.create',
  MEDICAL_RECORD_UPDATE: 'medical_record.update',
  PRESCRIPTION_CREATE: 'prescription.create',
  PRESCRIPTION_UPDATE: 'prescription.update',
  LAB_ORDER_CREATE: 'lab_order.create',
  LAB_ORDER_STATUS_UPDATE: 'lab_order.status_update',
  LAB_RESULT_SUBMIT: 'lab_result.submit',
  LAB_RESULT_VERIFY: 'lab_result.verify',
  MEDICINE_CREATE: 'medicine.create',
  BATCH_CREATE: 'batch.create',
  MEDICINE_DISPENSE: 'medicine.dispense',
  ADMISSION_CREATE: 'admission.create',
  ADMISSION_TRANSFER: 'admission.transfer',
  ADMISSION_DISCHARGE: 'admission.discharge',
  INVOICE_CREATE: 'invoice.create',
  PAYMENT_RECORD: 'payment.record',
  PAYMENT_REFUND: 'payment.refund',
});

module.exports = {
  ROLES,
  ALL_ROLES,
  ADMIN_ROLES,
  CLINICAL_ROLES,
  USER_STATUS,
  PATIENT_STATUS,
  APPOINTMENT_STATUS,
  PRESCRIPTION_STATUS,
  LAB_ORDER_STATUS,
  LAB_RESULT_STATUS,
  LAB_ORDER_PRIORITY,
  MEDICINE_STATUS,
  ADMISSION_STATUS,
  INVOICE_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  NOTIFICATION_TYPE,
  AUDIT_ACTIONS,
};
