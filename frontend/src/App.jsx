import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { ROLES } from './utils/roles';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import PatientsListPage from './pages/patients/PatientsListPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import DoctorsListPage from './pages/doctors/DoctorsListPage';
import DepartmentsPage from './pages/departments/DepartmentsPage';
import AppointmentsListPage from './pages/appointments/AppointmentsListPage';
import LabOrdersPage from './pages/laboratory/LabOrdersPage';
import PharmacyPage from './pages/pharmacy/PharmacyPage';
import AdmissionsPage from './pages/admissions/AdmissionsPage';
import InvoicesPage from './pages/billing/InvoicesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import UsersPage from './pages/users/UsersPage';
import AuditLogPage from './pages/audit/AuditLogPage';
import SettingsPage from './pages/settings/SettingsPage';

const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN];

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/doctors" element={<DoctorsListPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/appointments" element={<AppointmentsListPage />} />
          <Route path="/laboratory" element={<LabOrdersPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/billing" element={<InvoicesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={ADMIN_ROLES}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute roles={ADMIN_ROLES}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </AuthProvider>
  );
}
