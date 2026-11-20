import 'dotenv/config';
import pg from 'pg';

// node-postgres parses DATE columns into JS Date objects at local midnight.
// That shifts dates by the machine's timezone (e.g. 2025-11-01 becomes
// 2025-10-31T16:00:00Z) and breaks the date-only math in analytics.js.
// Keep DATE values as the 'YYYY-MM-DD' strings the database actually stores,
// which also matches the demo dataset exactly.
pg.types.setTypeParser(1082, (value) => value);

const connectionString = process.env.DATABASE_URL?.trim();

export const usingDatabase = Boolean(connectionString);

export const pool = usingDatabase
  ? new pg.Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? false : { rejectUnauthorized: false },
    })
  : null;

export async function pingDatabase() {
  if (!pool) return { ok: false, reason: 'DATABASE_URL is not set (running in demo mode)' };
  const result = await pool.query('SELECT NOW() AS now');
  return { ok: true, now: result.rows[0].now };
}
