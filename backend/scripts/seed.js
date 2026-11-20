// Seeds Neon with the real Cascadja menu and deterministic sample transactions.
// The old inn/campaign seeder is preserved as scripts/seed-legacy.js.
import 'dotenv/config';
import { generateRealDataset } from '../src/data/generateRealData.js';
import { pool } from '../src/db.js';

if (!pool) {
  console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and add your Neon connection string.');
  process.exit(1);
}

const data = generateRealDataset();

const TABLES = [
  {
    table: 'menu_items',
    columns: ['id', 'name', 'category', 'hot_price', 'iced_price', 'bestseller'],
    rows: data.menu.map((m) => [m.id, m.name, m.category, m.priceHot, m.priceIced, m.bestseller]),
  },
  {
    table: 'addons',
    columns: ['id', 'name', 'price', 'bestseller'],
    rows: data.addons.map((a) => [a.id, a.name, a.price, a.bestseller]),
  },
  {
    table: 'sales_fact',
    columns: [
      'id', 'order_id', 'order_date', 'daypart', 'channel', 'product_category',
      'item_name', 'item_price', 'quantity_sold', 'addon_name', 'addon_amount', 'total_sales',
    ],
    rows: data.sales.map((s) => [
      s.id, s.order_id, s.order_date, s.daypart, s.channel, s.product_category,
      s.item_name, s.item_price, s.quantity_sold, s.addon_name || null, s.addon_amount, s.total_sales,
    ]),
  },
];

async function bulkInsert(client, table, columns, rows) {
  const chunkSize = Math.max(1, Math.floor(60000 / columns.length));
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const params = [];
    let p = 1;
    const tuples = chunk.map((row) =>
      `(${columns.map(() => `$${p++}`).join(',')})`);
    for (const row of chunk) params.push(...row);
    await client.query(
      `INSERT INTO ${table} (${columns.join(',')}) VALUES ${tuples.join(',')}`,
      params,
    );
  }
}

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('TRUNCATE sales_fact, addons, menu_items RESTART IDENTITY CASCADE');

  for (const { table, columns, rows } of TABLES) {
    await bulkInsert(client, table, columns, rows);
    console.log(`  inserted ${String(rows.length).padStart(5)} rows into ${table}`);
  }

  for (const { table } of TABLES) {
    await client.query(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1))`,
    );
  }

  await client.query('COMMIT');
  console.log('\nSeed complete. Open the dashboard and refresh.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
