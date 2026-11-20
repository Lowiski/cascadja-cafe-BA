import { generateDataset } from './data/generate.js';
import { pool, usingDatabase } from './db.js';

const ROOM_INVENTORY = 4;

let demoCache = null;

function demo() {
  if (!demoCache) demoCache = generateDataset();
  return demoCache;
}

// In Neon the tables are read directly. In demo mode the identical dataset is
// generated in memory so the dashboard can be explored before the database is
// connected.
export async function loadData() {
  if (!usingDatabase) {
    const d = demo();
    return {
      customers: d.customers,
      products: d.products,
      campaigns: d.campaigns,
      transactions: d.transactions,
      sales: d.sales,
      roomInventory: ROOM_INVENTORY,
      source: 'demo',
    };
  }

  const [customers, products, campaigns, transactions, sales] = await Promise.all([
    pool.query('SELECT * FROM customers ORDER BY id'),
    pool.query('SELECT * FROM products ORDER BY id'),
    pool.query('SELECT * FROM marketing_campaigns ORDER BY id'),
    pool.query('SELECT * FROM transactions ORDER BY id'),
    pool.query('SELECT * FROM sales ORDER BY id'),
  ]);

  return {
    customers: customers.rows,
    products: products.rows,
    campaigns: campaigns.rows,
    transactions: transactions.rows,
    sales: sales.rows,
    roomInventory: ROOM_INVENTORY,
    source: 'neon',
  };
}

export async function getCounts() {
  if (!usingDatabase) {
    const d = demo();
    return {
      customers: d.customers.length,
      products: d.products.length,
      marketing: d.campaigns.length,
      transactions: d.transactions.length,
      sales: d.sales.length,
    };
  }
  const [customers, products, marketing, transactions, sales] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS n FROM customers'),
    pool.query('SELECT COUNT(*)::int AS n FROM products'),
    pool.query('SELECT COUNT(*)::int AS n FROM marketing_campaigns'),
    pool.query('SELECT COUNT(*)::int AS n FROM transactions'),
    pool.query('SELECT COUNT(*)::int AS n FROM sales'),
  ]);
  return {
    customers: customers.rows[0].n,
    products: products.rows[0].n,
    marketing: marketing.rows[0].n,
    transactions: transactions.rows[0].n,
    sales: sales.rows[0].n,
  };
}

function validateCustomer(body) {
  const clean = {
    first_name: String(body.first_name || '').trim(),
    last_name: String(body.last_name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    city: String(body.city || '').trim() || 'Bacolod',
    segment: String(body.segment || '').trim() || 'Young Professional',
    loyalty_points: Number(body.loyalty_points) || 0,
  };
  if (!clean.first_name || !clean.last_name) throw new Error('First and last name are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) throw new Error('A valid email is required.');
  return clean;
}

export async function addCustomer(body) {
  const c = validateCustomer(body);
  if (!usingDatabase) {
    const d = demo();
    if (d.customers.some((x) => x.email === c.email)) throw new Error('That email already exists.');
    const row = {
      ...c,
      id: Math.max(0, ...d.customers.map((x) => x.id)) + 1,
      joined_at: new Date().toISOString().slice(0, 10),
    };
    d.customers.push(row);
    return row;
  }
  const result = await pool.query(
    `INSERT INTO customers (first_name, last_name, email, city, segment, joined_at, loyalty_points)
     VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)
     RETURNING *`,
    [c.first_name, c.last_name, c.email, c.city, c.segment, c.loyalty_points],
  );
  return result.rows[0];
}
