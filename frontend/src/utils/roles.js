// Mirrors backend src/utils/constants.js ROLES exactly.
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital_admin',
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  ACCOUNTANT: 'accountant',
  PATIENT: 'patient',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.HOSPITAL_ADMIN]: 'Hospital Admin',
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.NURSE]: 'Nurse',
  [ROLES.LAB_TECHNICIAN]: 'Lab Technician',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.PATIENT]: 'Patient',
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN];

/** True if `userRole` is included in `allowedRoles` (empty list = any authenticated role). */
export function hasRole(userRole, allowedRoles = []) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}
