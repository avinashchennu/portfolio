import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute, HomeRedirect } from './auth/RouteGuards.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './user/Dashboard.jsx';
import Templates from './user/Templates.jsx';
import Portfolio from './user/Portfolio.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      {/* login module */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* user module */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Route>

      {/* admin module */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* shareable link, no login needed */}
      <Route path="/p/:id" element={<Portfolio />} />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
