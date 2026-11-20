// Legacy seeder for the original fictional cafe-and-inn dataset. Kept as reference.
import 'dotenv/config';
import { generateDataset } from '../src/data/generate.js';
import { pool } from '../src/db.js';

if (!pool) {
  console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and add your Neon connection string.');
  process.exit(1);
}

const data = generateDataset();
const TABLES = [
  ['customers', ['id','first_name','last_name','email','city','segment','joined_at','loyalty_points'], data.customers],
  ['products', ['id','name','category','unit_price','unit_cost','is_room'], data.products],
  ['marketing_campaigns', ['id','campaign_name','channel','start_date','end_date','spend','impressions','clicks','conversions','revenue_attributed'], data.campaigns],
  ['transactions', ['id','customer_id','txn_date','channel','payment_method','status','total_amount'], data.transactions],
  ['sales', ['id','transaction_id','product_id','sale_date','quantity','unit_price','line_total'], data.sales],
];

async function bulkInsert(client, table, columns, rows) {
  const chunkSize = Math.floor(60000 / columns.length);
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const params = [];
    let p = 1;
    const tuples = chunk.map((row) =>
      `(${columns.map((col) => { params.push(row[col] ?? null); return `$${p++}`; }).join(',')})`);
    await client.query(`INSERT INTO ${table} (${columns.join(',')}) VALUES ${tuples.join(',')}`, params);
  }
}

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('TRUNCATE sales, transactions, marketing_campaigns, products, customers RESTART IDENTITY CASCADE');
  for (const [table, columns, rows] of TABLES) {
    await bulkInsert(client, table, columns, rows);
    console.log(`  inserted ${String(rows.length).padStart(5)} rows into ${table}`);
  }
  for (const [table] of TABLES) {
    await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1))`);
  }
  await client.query('COMMIT');
  console.log('\nLegacy seed complete.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
