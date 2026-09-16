import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roles';
import Spinner from './ui/Spinner';

/**
 * Guards a route behind authentication, and optionally behind a role
 * allow-list. This is a UX convenience only -- the backend's RBAC middleware
 * is the actual security boundary; hiding a button here never substitutes
 * for the API rejecting an unauthorized call.
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <Spinner label="Checking your session…" className="h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRole(user?.role, roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
