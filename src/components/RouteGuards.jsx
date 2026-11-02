import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth-context.js';

function Splash() {
  return <p className="page-status">Loading…</p>;
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
