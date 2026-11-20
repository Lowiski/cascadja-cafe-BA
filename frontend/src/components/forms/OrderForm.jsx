import { useState } from 'react';
import Icon from '../common/Icon.jsx';

const CHANNELS = ['Dine-in', 'Takeout', 'Delivery', 'Room Stay'];
const PAYMENTS = ['Cash', 'Card', 'GCash', 'Bank Transfer'];

// Reusable order/transaction header form for the orders page scaffold.
export default function OrderForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    customer_id: initial.customer_id || '',
    txn_date: initial.txn_date || new Date().toISOString().slice(0, 10),
    channel: initial.channel || 'Dine-in',
    payment_method: initial.payment_method || 'Cash',
    status: initial.status || 'Completed',
    total_amount: initial.total_amount ?? '',
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
    >
      <label className="field">
        <span>Customer ID (optional)</span>
        <input type="number" min="1" value={form.customer_id} onChange={set('customer_id')} placeholder="Walk-in" />
      </label>
      <label className="field">
        <span>Date</span>
        <input type="date" value={form.txn_date} onChange={set('txn_date')} />
      </label>
      <label className="field">
        <span>Channel</span>
        <select value={form.channel} onChange={set('channel')}>
          {CHANNELS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Payment method</span>
        <select value={form.payment_method} onChange={set('payment_method')}>
          {PAYMENTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Total amount</span>
        <input required type="number" min="0" step="0.01" value={form.total_amount} onChange={set('total_amount')} />
      </label>
      <label className="field">
        <span>Status</span>
        <select value={form.status} onChange={set('status')}>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </label>
      <div className="modal__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary">
          <Icon name="cart" size={16} /> Save order
        </button>
      </div>
    </form>
  );
}
