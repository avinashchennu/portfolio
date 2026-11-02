import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context.js';
import AuthShell from '../components/AuthShell.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');

    setBusy(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Start building"
      blurb="Create an account to open your editor. Your details, skills, and projects are saved to your account."
    >
      <form onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        {error && <p className="error-msg visible" role="alert">{error}</p>}

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" required autoComplete="name" value={form.name} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={update} />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" value={form.confirm} onChange={update} />
        </div>

        <button type="submit" className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Sign up'}</button>
        <p className="form-foot">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
