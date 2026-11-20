import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { getMenu } from '../../services/analyticsService.js';
import { createSale } from '../../services/orderService.js';
import { peso } from '../../format.js';

const DAYPARTS = ['Morning', 'Lunch', 'Afternoon', 'Evening', 'Late Night'];
const CHANNELS = ['Dine-in', 'Foodpanda'];

const today = () => new Date().toISOString().slice(0, 10);

export default function SaleForm({ open, onClose, onCreated }) {
  const { data, loading } = useFetch(getMenu, []);
  const [form, setForm] = useState({
    order_date: today(),
    daypart: 'Morning',
    channel: 'Dine-in',
    item_name: '',
    priceType: 'hot',
    product_category: '',
    item_price: '',
    quantity_sold: 1,
    addon_name: '',
    addon_amount: '',
    order_id: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const menu = data?.menu || [];
  const addons = data?.addons || [];
  const selectedItem = menu.find((m) => m.name === form.item_name);

  useEffect(() => {
    if (!form.item_name && menu.length) {
      const first = menu[0];
      setForm((f) => ({
        ...f,
        item_name: first.name,
        product_category: first.category,
        item_price: String(first.priceHot),
      }));
    }
  }, [menu, form.item_name]);

  if (!open) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  function chooseItem(name) {
    const item = menu.find((m) => m.name === name);
    setForm((f) => ({
      ...f,
      item_name: name,
      priceType: 'hot',
      product_category: item?.category || '',
      item_price: item ? String(item.priceHot) : '',
    }));
  }

  function choosePriceType(type) {
    const price = type === 'iced' ? selectedItem?.priceIced : selectedItem?.priceHot;
    setForm((f) => ({ ...f, priceType: type, item_price: price == null ? '' : String(price) }));
  }

  function chooseAddon(name) {
    const addon = addons.find((a) => a.name === name);
    setForm((f) => ({ ...f, addon_name: name, addon_amount: addon ? String(addon.price) : '' }));
  }

  const total = (Number(form.item_price) || 0) * (Number(form.quantity_sold) || 0)
    + (Number(form.addon_amount) || 0);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createSale(form);
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Could not save the sale.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Add a sale"
      subtitle="Saved directly to the Neon sales_fact table"
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        {loading && <p className="muted small">Loading the menu…</p>}

        <div className="form-grid">
          <label className="field">
            <span>Order date</span>
            <input
              type="date"
              value={form.order_date}
              onChange={(e) => set('order_date', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Daypart</span>
            <select value={form.daypart} onChange={(e) => set('daypart', e.target.value)}>
              {DAYPARTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Channel</span>
            <select value={form.channel} onChange={(e) => set('channel', e.target.value)}>
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Order ID <em>(blank = new order)</em></span>
            <input
              type="number"
              min="1"
              value={form.order_id}
              onChange={(e) => set('order_id', e.target.value)}
              placeholder="Auto"
            />
          </label>
        </div>

        <label className="field field--wide">
          <span>Menu item</span>
          <select value={form.item_name} onChange={(e) => chooseItem(e.target.value)} required>
            {!menu.length && <option value="">No menu items loaded</option>}
            {menu.map((m) => <option key={m.id} value={m.name}>{m.name} — {m.category}</option>)}
          </select>
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Category</span>
            <input
              value={form.product_category}
              onChange={(e) => set('product_category', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Price variant</span>
            <select value={form.priceType} onChange={(e) => choosePriceType(e.target.value)}>
              <option value="hot">Hot / regular — ₱{selectedItem?.priceHot ?? '—'}</option>
              {selectedItem?.priceIced != null && (
                <option value="iced">Iced / large — ₱{selectedItem.priceIced}</option>
              )}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Item price (₱)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.item_price}
              onChange={(e) => set('item_price', e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Quantity</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.quantity_sold}
              onChange={(e) => set('quantity_sold', e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Add-on</span>
            <select value={form.addon_name} onChange={(e) => chooseAddon(e.target.value)}>
              <option value="">No add-on</option>
              {addons.map((a) => <option key={a.id} value={a.name}>{a.name} — ₱{a.price}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Add-on amount (₱)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.addon_amount}
              onChange={(e) => set('addon_amount', e.target.value)}
            />
          </label>
        </div>

        <div className="admin-total">
          <span>Line total</span>
          <strong>{peso(total)}</strong>
          <small>price × quantity + add-on · calculated by the server</small>
        </div>

        <div className="modal__actions">
          <button className="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" type="submit" disabled={busy || loading}>
            <Icon name="plus" size={16} />
            {busy ? 'Saving…' : 'Save sale'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
