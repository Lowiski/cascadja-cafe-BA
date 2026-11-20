import { pool, usingDatabase } from '../db.js';
import { invalidateCache } from '../store.js';
import { ADDONS, DAYPARTS, CHANNELS } from '../data/generateRealData.js';
import { HttpError } from '../utils/httpError.js';

// Writes always go to Neon. We deliberately do not pretend a generated sample
// dataset was "saved" — the owner's new menu/sales must live in the database.
export function canWrite() {
  return Boolean(usingDatabase && pool);
}

function ensureDatabase() {
  if (!canWrite()) {
    throw new HttpError(503, 'Database is not configured. Add DATABASE_URL to backend/.env and run npm run db:setup.');
  }
}

const clean = (value) => String(value ?? '').trim();

function money(value, label, { min = 0 } = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < min) {
    throw new HttpError(400, `${label} must be a number of at least ${min}.`);
  }
  return Math.round(amount * 100) / 100;
}

function isBestseller(value) {
  return value === true || value === 1 || ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

function normalizeMenu(row) {
  return {
    ...row,
    hot_price: Number(row.hot_price),
    iced_price: row.iced_price == null ? null : Number(row.iced_price),
  };
}

function normalizeSale(row) {
  return {
    ...row,
    order_date: String(row.order_date).slice(0, 10),
    item_price: Number(row.item_price),
    quantity_sold: Number(row.quantity_sold),
    addon_amount: Number(row.addon_amount),
    total_sales: Number(row.total_sales),
  };
}

export async function createMenuItem(body = {}) {
  ensureDatabase();

  const name = clean(body.name);
  const category = clean(body.category);
  if (!name) throw new HttpError(400, 'Menu item name is required.');
  if (!category) throw new HttpError(400, 'Category is required.');

  const hotPrice = money(body.hot_price, 'Hot / regular price', { min: 1 });
  const rawIced = body.iced_price;
  const icedPrice = rawIced === '' || rawIced == null
    ? null
    : money(rawIced, 'Iced / large price', { min: 1 });

  try {
    const result = await pool.query(
      `INSERT INTO menu_items (name, category, hot_price, iced_price, bestseller)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, category, hot_price, iced_price, bestseller`,
      [name, category, hotPrice, icedPrice, isBestseller(body.bestseller)],
    );
    invalidateCache();
    return normalizeMenu(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(400, 'A menu item with that name already exists.');
    throw err;
  }
}

export async function createSale(body = {}) {
  ensureDatabase();

  const itemName = clean(body.item_name);
  if (!itemName) throw new HttpError(400, 'Choose a menu item.');

  const found = await pool.query(
    'SELECT name, category, hot_price FROM menu_items WHERE name = $1',
    [itemName],
  );
  if (!found.rows.length) {
    throw new HttpError(400, 'That item is not in the menu. Add it first.');
  }
  const menuItem = found.rows[0];

  const orderDate = clean(body.order_date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) {
    throw new HttpError(400, 'Order date must be in YYYY-MM-DD format.');
  }

  const daypart = clean(body.daypart);
  if (!DAYPARTS.includes(daypart)) {
    throw new HttpError(400, `Daypart must be one of: ${DAYPARTS.join(', ')}.`);
  }

  const channel = clean(body.channel);
  if (!CHANNELS.includes(channel)) {
    throw new HttpError(400, 'Channel must be Dine-in or Foodpanda.');
  }

  const productCategory = clean(body.product_category) || clean(menuItem.category);
  if (!productCategory) throw new HttpError(400, 'Product category is required.');

  const quantitySold = Number(body.quantity_sold);
  if (!Number.isInteger(quantitySold) || quantitySold < 1) {
    throw new HttpError(400, 'Quantity must be a whole number of at least 1.');
  }

  const rawPrice = body.item_price;
  const itemPrice = rawPrice === '' || rawPrice == null
    ? money(menuItem.hot_price, 'Item price', { min: 1 })
    : money(rawPrice, 'Item price', { min: 1 });

  const addonName = clean(body.addon_name);
  let addonAmount = 0;
  if (addonName && addonName.toLowerCase() !== 'no add-on') {
    const known = ADDONS.find((a) => a.name.toLowerCase() === addonName.toLowerCase());
    addonAmount = body.addon_amount === '' || body.addon_amount == null
      ? known?.price || 0
      : money(body.addon_amount, 'Add-on amount', { min: 0 });
  }

  let orderId = body.order_id === '' || body.order_id == null ? null : Number(body.order_id);
  if (orderId != null && (!Number.isInteger(orderId) || orderId < 1)) {
    throw new HttpError(400, 'Order ID must be a positive whole number.');
  }
  if (orderId == null) {
    const next = await pool.query('SELECT COALESCE(MAX(order_id), 0) + 1 AS next_id FROM sales_fact');
    orderId = Number(next.rows[0].next_id);
  }

  const totalSales = Math.round((itemPrice * quantitySold + addonAmount) * 100) / 100;

  const result = await pool.query(
    `INSERT INTO sales_fact
       (order_id, order_date, daypart, channel, product_category, item_name,
        item_price, quantity_sold, addon_name, addon_amount, total_sales)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, order_id, order_date, daypart, channel, product_category, item_name,
               item_price, quantity_sold, addon_name, addon_amount, total_sales`,
    [
      orderId, orderDate, daypart, channel, productCategory, itemName,
      itemPrice, quantitySold, addonName || null, addonAmount, totalSales,
    ],
  );

  invalidateCache();
  return normalizeSale(result.rows[0]);
}
