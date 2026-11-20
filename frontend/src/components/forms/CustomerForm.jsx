import { useState } from 'react';
import { addCustomer } from '../../services/customerService.js';
import Icon from '../common/Icon.jsx';

const SEGMENTS = ['Student', 'Young Professional', 'Family', 'Tourist', 'Corporate'];

// Extracted from DataExplorer's add-customer dialog. The explorer still passes
// onSaved/onClose, so behaviour is unchanged.
export default function CustomerForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    city: 'Bacolod',
    segment: 'Young Professional',
    loyalty_points: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addCustomer(form);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Add customer">
      <div className="modal">
        <header className="modal__head">
          <div>
            <h3>Add a loyalty customer</h3>
            <p>This inserts a real row into the customers table.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <form className="modal__body" onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>First name</span>
              <input required value={form.first_name} onChange={set('first_name')} placeholder="Maria" />
            </label>
            <label className="field">
              <span>Last name</span>
              <input required value={form.last_name} onChange={set('last_name')} placeholder="Santos" />
            </label>
          </div>
          <label className="field">
            <span>Email</span>
            <input required type="email" value={form.email} onChange={set('email')} placeholder="maria@example.com" />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>City</span>
              <input value={form.city} onChange={set('city')} />
            </label>
            <label className="field">
              <span>Segment</span>
              <select value={form.segment} onChange={set('segment')}>
                {SEGMENTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Loyalty points</span>
            <input type="number" min="0" value={form.loyalty_points} onChange={set('loyalty_points')} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
