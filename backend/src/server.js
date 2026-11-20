import app from './app.js';
import { usingDatabase, pingDatabase } from './db.js';

const port = Number(process.env.PORT) || 4000;

app.listen(port, '0.0.0.0', async () => {
  console.log(`Cascadja Foods and Drinks API listening on port ${port}`);
  console.log(`Data source: ${usingDatabase ? 'Neon Postgres' : 'DEMO MODE'}`);

  if (usingDatabase) {
    try {
      await pingDatabase();
      console.log('Neon connection OK');
    } catch (err) {
      console.warn(`Neon connection failed: ${err.message}`);
    }
  }
});