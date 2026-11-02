import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homePath } from '../auth/auth-context.js';
import AuthShell from '../components/AuthShell.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form);
      navigate(homePath(user));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Portfolio Maker"
      blurb="Fill in a form. Get a portfolio page you can share with a link."
    >
      <form onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        {error && <p className="error-msg visible" role="alert">{error}</p>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={update} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" value={form.password} onChange={update} />
        </div>

        <button type="submit" className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <div className="demo-logins">
          <button type="button" className="btn secondary" onClick={() => setForm({ email: 'demo@example.com', password: 'demo1234' })}>
            Fill user demo
          </button>
          <button type="button" className="btn secondary" onClick={() => setForm({ email: 'admin@example.com', password: 'admin1234' })}>
            Fill admin demo
          </button>
        </div>
        <p className="form-foot">No account yet? <Link to="/signup">Create one</Link></p>
      </form>
    </AuthShell>
  );
}
