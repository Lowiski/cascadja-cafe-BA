import { queryTable } from '../services/dataQueryService.js';

export async function listTransactions(req, res) {
  res.json(await queryTable('transactions', req.query));
}

// Original generic explorer endpoint: GET /api/data/:table
export async function listTable(req, res) {
  const result = await queryTable(req.params.table, req.query);
  if (!result) return res.status(404).json({ error: `Unknown table "${req.params.table}"` });
  res.json(result);
}
