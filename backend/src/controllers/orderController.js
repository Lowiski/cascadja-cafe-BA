import { querySales } from '../services/dataQueryService.js';
import { createSale } from '../services/writeService.js';

export async function listSalesData(req, res) {
  res.json(await querySales(req.query));
}

export async function addSale(req, res) {
  const created = await createSale(req.body || {});
  res.status(201).json({ sale: created });
}
