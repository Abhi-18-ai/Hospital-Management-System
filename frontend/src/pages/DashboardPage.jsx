import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarClock, BedDouble, Receipt, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/roles';
import { patientsApi } from '../api/patients.api';
import { appointmentsApi } from '../api/appointments.api';
import { admissionsApi } from '../api/admissions.api';
import { billingApi } from '../api/billing.api';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HOSPITAL_ADMIN,
  ROLES.RECEPTIONIST,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.LAB_TECHNICIAN,
  ROLES.PHARMACIST,
  ROLES.ACCOUNTANT,
];

function StatCard({ icon: Icon, label, value, to, accent }) {
  return (
    <Link to={to} className="group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{value ?? '—'}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isStaff = STAFF_ROLES.includes(user?.role);
  const [stats, setStats] = useState({ patients: null, appointments: null, admissions: null, invoices: null });

  useEffect(() => {
    if (!isStaff) return;
    let cancelled = false;

    async function loadStats() {
      const results = await Promise.allSettled([
        patientsApi.list({ page: 1, limit: 1 }),
        appointmentsApi.list({ page: 1, limit: 1, status: 'scheduled' }),
        admissionsApi.list({ page: 1, limit: 1, status: 'admitted' }),
        billingApi.listInvoices({ page: 1, limit: 1, status: 'issued' }),
      ]);
      if (cancelled) return;
      const [patients, appointments, admissions, invoices] = results;
      setStats({
        patients: patients.status === 'fulfilled' ? patients.value.data?.meta?.total : null,
        appointments: appointments.status === 'fulfilled' ? appointments.value.data?.meta?.total : null,
        admissions: admissions.status === 'fulfilled' ? admissions.value.data?.meta?.total : null,
        invoices: invoices.status === 'fulfilled' ? invoices.value.data?.meta?.total : null,
      });
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [isStaff]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-ink-900">Welcome back, {user?.name?.split(' ')[0]}.</h2>
        <p className="text-sm text-ink-500">Here's what's happening across the hospital today.</p>
      </div>

      {isStaff && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Registered Patients" value={stats.patients} to="/patients" accent="bg-brand-500" />
          <StatCard
            icon={CalendarClock}
            label="Scheduled Appointments"
            value={stats.appointments}
            to="/appointments"
            accent="bg-status-blue"
          />
          <StatCard icon={BedDouble} label="Active Admissions" value={stats.admissions} to="/admissions" accent="bg-status-amber" />
          <StatCard icon={Receipt} label="Outstanding Invoices" value={stats.invoices} to="/billing" accent="bg-status-red" />
        </div>
      )}

      <Card>
        <CardHeader title="Quick actions" subtitle="Jump straight into common workflows." />
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/appointments', label: 'Book an appointment' },
            { to: '/patients', label: isStaff ? 'Register a new patient' : 'View my patient profile' },
            { to: '/notifications', label: 'Check notifications' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center justify-between rounded-lg border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50"
            >
              {action.label}
              <ArrowRight className="h-4 w-4 text-ink-400" />
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
