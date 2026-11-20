import { queryTable } from '../services/dataQueryService.js';

export async function listProducts(req, res) {
  res.json(await queryTable('products', req.query));
}
