import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';
import { isAuthenticated, login } from '../services/authService.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate(from, { replace: true });
  }, [from, navigate]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__glow" aria-hidden="true" />
      <form className="login-card" onSubmit={submit}>
        <div className="login-card__brand">
          <span className="login-card__mark">
            <img src="/logo.png" alt="" width="34" height="34" />
          </span>
          <span>
            <strong>Cascadja</strong>
            <small>Foods and Drinks</small>
          </span>
        </div>

        <p className="eyebrow">Admin access</p>
        <h2>Sign in to manage the dashboard</h2>
        <p className="muted">
          Only the administrator can add new menu items and sales. Analytics are visible after sign-in.
        </p>

        {error && <div className="form-error" role="alert">{error}</div>}

        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="admin"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••••••"
            required
          />
        </label>

        <button className="btn btn--primary login-card__submit" type="submit" disabled={busy}>
          <Icon name="lock" size={16} />
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="login-card__hint">
          Credentials are set in <code>backend/.env</code>. Ask the system owner for access.
        </p>
      </form>
    </div>
  );
}
