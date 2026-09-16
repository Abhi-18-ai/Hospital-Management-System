export const APPOINTMENT_STATUS_COLORS = {
  scheduled: 'blue',
  checked_in: 'amber',
  in_progress: 'amber',
  completed: 'green',
  cancelled: 'red',
  no_show: 'red',
};

export const INVOICE_STATUS_COLORS = {
  draft: 'slate',
  issued: 'blue',
  partially_paid: 'amber',
  paid: 'green',
  refunded: 'slate',
  cancelled: 'red',
};

export const LAB_ORDER_STATUS_COLORS = {
  ordered: 'blue',
  sample_collected: 'amber',
  in_progress: 'amber',
  result_submitted: 'blue',
  verified: 'green',
  cancelled: 'red',
};

export const ADMISSION_STATUS_COLORS = {
  admitted: 'blue',
  transferred: 'amber',
  discharged: 'green',
};

export const PRESCRIPTION_STATUS_COLORS = {
  active: 'blue',
  completed: 'green',
  cancelled: 'red',
};

export const GENERIC_STATUS_COLORS = {
  active: 'green',
  inactive: 'slate',
  suspended: 'red',
  on_leave: 'amber',
  pending: 'amber',
  submitted: 'blue',
  verified: 'green',
  rejected: 'red',
  success: 'green',
  failed: 'red',
  refunded: 'slate',
};

export const PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'insurance', 'other'];

export const WARDS = ['General Ward', 'ICU', 'Maternity Ward', 'Pediatric Ward'];
