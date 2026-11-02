import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';

export default function AppHeader({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <Link to="/" className="brand">Portfolio Maker</Link>
      <nav>
        {children}
        {user?.role === 'admin' && <Link className="btn secondary" to="/admin">Admin</Link>}
        <button className="btn danger" type="button" onClick={handleLogout}>Log out</button>
      </nav>
    </header>
  );
}
