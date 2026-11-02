// Admin module (frontend): overview numbers and user management
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AppHeader from '../components/AppHeader.jsx';

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '-');

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([api.adminStats(), api.adminUsers()]);
      setStats(s);
      setUsers(u.users);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} (${user.email})? This removes their portfolio too.`)) return;
    try {
      await api.adminDeleteUser(user.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <AppHeader>
        <Link className="btn secondary" to="/dashboard">My portfolio</Link>
      </AppHeader>

      <main className="admin-wrap">
        <div>
          <h2>Admin overview</h2>
          <p className="save-msg">All accounts and portfolios on this site.</p>
        </div>

        {error && <p className="error-msg visible" role="alert">{error}</p>}
        {!loaded && <p className="page-status">Loading…</p>}

        {stats && (
          <section className="stat-grid">
            <div className="stat-card"><span className="stat-value">{stats.totalUsers}</span><span className="stat-label">Total accounts</span></div>
            <div className="stat-card"><span className="stat-value">{stats.totalProjects}</span><span className="stat-label">Projects added</span></div>
            <div className="stat-card"><span className="stat-value">{stats.byTemplate.workshop}</span><span className="stat-label">Using Workshop</span></div>
            <div className="stat-card"><span className="stat-value">{stats.byTemplate.editorial}</span><span className="stat-label">Using Editorial</span></div>
            <div className="stat-card"><span className="stat-value">{stats.byTemplate.minimal}</span><span className="stat-label">Using Minimal</span></div>
          </section>
        )}

        {loaded && (
          <section className="panel">
            <h2>Users</h2>
            <div className="table-scroll">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Template</th>
                    <th>Projects</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                      <td>{u.template}</td>
                      <td>{u.projects}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <Link to={`/p/${u.id}`} target="_blank">View</Link>
                        {u.role !== 'admin' && (
                          <>
                            {' '}
                            <button className="btn danger small" type="button" onClick={() => handleDelete(u)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
