import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, homePath } from './auth-context.js';

function Splash() {
  return <p className="page-status">Loading…</p>;
}

// logged-in users only
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// login and signup pages: logged-in users are sent to their home page
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Navigate to={homePath(user)} replace /> : <Outlet />;
}

// admins only
export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

// "/" goes to the right place for whoever is visiting
export function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return <Navigate to={user ? homePath(user) : '/login'} replace />;
}
