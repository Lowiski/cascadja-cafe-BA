import { useState } from 'react';
import Icon from '../common/Icon.jsx';

const CATEGORIES = ['Coffee', 'Food', 'Pastry', 'Beverage', 'Room'];

// Reusable product editor for the products page scaffold. Writing products is
// not part of the capstone API, so submissions are handed to `onSubmit`.
export default function ProductForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    category: initial.category || 'Coffee',
    unit_price: initial.unit_price ?? '',
    unit_cost: initial.unit_cost ?? '',
    is_room: Boolean(initial.is_room),
  });
  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === 'is_room' ? e.target.checked : e.target.value }));

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
    >
      <label className="field">
        <span>Name</span>
        <input required value={form.name} onChange={set('name')} placeholder="Cascadja latte" />
      </label>
      <label className="field">
        <span>Category</span>
        <select value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Unit price</span>
        <input required type="number" min="0" step="0.01" value={form.unit_price} onChange={set('unit_price')} />
      </label>
      <label className="field">
        <span>Unit cost</span>
        <input required type="number" min="0" step="0.01" value={form.unit_cost} onChange={set('unit_cost')} />
      </label>
      <label className="checkbox">
        <input type="checkbox" checked={form.is_room} onChange={set('is_room')} /> Room product
      </label>
      <div className="modal__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary">
          <Icon name="spark" size={16} /> Save product
        </button>
      </div>
    </form>
  );
}
