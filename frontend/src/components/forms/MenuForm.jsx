import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import { createMenuItem } from '../../services/productService.js';

const CATEGORIES = [
  'Coffee', 'Coffee-Based Frappe', 'Signature', 'Real Fruit Smoothie', 'Ade',
  'Milktea', 'Rice Meal', 'Pasta', 'Snacks', 'Tiramisu', 'Croffles', 'Bread & Salad',
];

export default function MenuForm({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    hot_price: '',
    iced_price: '',
    bestseller: false,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createMenuItem({
        ...form,
        hot_price: Number(form.hot_price),
        iced_price: form.iced_price === '' ? null : Number(form.iced_price),
        bestseller: form.bestseller,
      });
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Could not save the menu item.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Add a menu item"
      subtitle="Saved directly to the Neon menu_items table"
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}

        <label className="field field--wide">
          <span>Item name</span>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Iced Matcha Latte"
            required
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Category</span>
            <input
              list="cascadja-categories"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              required
            />
            <datalist id="cascadja-categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>

          <label className="field">
            <span>Hot / regular price (₱)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.hot_price}
              onChange={(e) => set('hot_price', e.target.value)}
              placeholder="150"
              required
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Iced / large price (₱)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.iced_price}
              onChange={(e) => set('iced_price', e.target.value)}
              placeholder="Leave blank for one price"
            />
          </label>

          <label className="check-field">
            <input
              type="checkbox"
              checked={form.bestseller}
              onChange={(e) => set('bestseller', e.target.checked)}
            />
            <span>★ Mark as bestseller</span>
          </label>
        </div>

        <div className="modal__actions">
          <button className="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            <Icon name="plus" size={16} />
            {busy ? 'Saving…' : 'Save menu item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
