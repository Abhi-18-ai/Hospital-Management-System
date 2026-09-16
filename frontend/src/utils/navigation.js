// import {
//   LayoutDashboard,
//   Users,
//   Stethoscope,
//   Building2,
//   CalendarClock,
//   FlaskConical,
//   Pill,
//   BedDouble,
//   Receipt,
//   Bell,
//   ShieldCheck,
//   UserCog,
// } from 'lucide-react';
// import { ROLES } from './roles';

// const ALL_STAFF = [
//   ROLES.SUPER_ADMIN,
//   ROLES.HOSPITAL_ADMIN,
//   ROLES.RECEPTIONIST,
//   ROLES.DOCTOR,
//   ROLES.NURSE,
//   ROLES.LAB_TECHNICIAN,
//   ROLES.PHARMACIST,
//   ROLES.ACCOUNTANT,
// ];

// // Single source of truth for the sidebar. `roles: []` means "any authenticated user".
// export const NAV_ITEMS = [
//   { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: [] },
//   {
//     to: '/patients',
//     label: 'Patients',
//     icon: Users,
//     roles: [...ALL_STAFF, ROLES.PATIENT],
//   },
//   { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ALL_STAFF },
//   { to: '/departments', label: 'Departments', icon: Building2, roles: ALL_STAFF },
//   {
//     to: '/appointments',
//     label: 'Appointments',
//     icon: CalendarClock,
//     roles: [...ALL_STAFF, ROLES.PATIENT],
//   },
//   {
//     to: '/laboratory',
//     label: 'Laboratory',
//     icon: FlaskConical,
//     roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.LAB_TECHNICIAN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT],
//   },
//   {
//     to: '/pharmacy',
//     label: 'Pharmacy',
//     icon: Pill,
//     roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE],
//   },
//   {
//     to: '/admissions',
//     label: 'Admissions',
//     icon: BedDouble,
//     roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT],
//   },
//   {
//     to: '/billing',
//     label: 'Billing',
//     icon: Receipt,
//     roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.PATIENT],
//   },
//   { to: '/notifications', label: 'Notifications', icon: Bell, roles: [] },
//   { to: '/users', label: 'Users', icon: UserCog, roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
//   { to: '/audit', label: 'Audit Log', icon: ShieldCheck, roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
// ];

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  CalendarClock,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  Bell,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { ROLES } from './roles';

const ALL_STAFF = [
  ROLES.SUPER_ADMIN,
  ROLES.HOSPITAL_ADMIN,
  ROLES.RECEPTIONIST,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.LAB_TECHNICIAN,
  ROLES.PHARMACIST,
  ROLES.ACCOUNTANT,
];

// Single source of truth for the sidebar. `roles: []` means "any authenticated user".
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: [] },
  {
    to: '/patients',
    label: 'Patients',
    icon: Users,
    roles: ALL_STAFF,
  },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ALL_STAFF },
  { to: '/departments', label: 'Departments', icon: Building2, roles: ALL_STAFF },
  {
    to: '/appointments',
    label: 'Appointments',
    icon: CalendarClock,
    roles: [...ALL_STAFF, ROLES.PATIENT],
  },
  {
    to: '/laboratory',
    label: 'Laboratory',
    icon: FlaskConical,
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.LAB_TECHNICIAN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT],
  },
  {
    to: '/pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE],
  },
  {
    to: '/admissions',
    label: 'Admissions',
    icon: BedDouble,
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT],
  },
  {
    to: '/billing',
    label: 'Billing',
    icon: Receipt,
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.PATIENT],
  },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: [] },
  { to: '/users', label: 'Users', icon: UserCog, roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
  { to: '/audit', label: 'Audit Log', icon: ShieldCheck, roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
];

/**
 * Where each role should land right after logging in, instead of always
 * dropping everyone on the generic dashboard. Chosen to match what that
 * role actually needs to do first: a doctor checks their appointments, a
 * pharmacist checks the pharmacy queue, an admin gets the full overview.
 * Admins/super-admins still get the dashboard since oversight is their job.
 */
export const ROLE_HOME_ROUTE = {
  [ROLES.SUPER_ADMIN]: '/',
  [ROLES.HOSPITAL_ADMIN]: '/',
  [ROLES.RECEPTIONIST]: '/appointments',
  [ROLES.DOCTOR]: '/appointments',
  [ROLES.NURSE]: '/patients',
  [ROLES.LAB_TECHNICIAN]: '/laboratory',
  [ROLES.PHARMACIST]: '/pharmacy',
  [ROLES.ACCOUNTANT]: '/billing',
  [ROLES.PATIENT]: '/appointments',
};

export function getHomeRouteForRole(role) {
  return ROLE_HOME_ROUTE[role] || '/';
}