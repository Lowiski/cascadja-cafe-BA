// Creates the active Cascadja Foods and Drinks tables in the Neon database.
// WARNING: this drops and recreates the three active app tables.
// Legacy inn/campaign tables are left untouched.
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!pool) {
  console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and add your Neon connection string.');
  process.exit(1);
}

try {
  const sql = await fs.readFile(path.resolve(__dirname, '../../database/schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Schema created: menu_items, addons, sales_fact (legacy tables untouched)');
} catch (err) {
  console.error('Failed to create schema:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
