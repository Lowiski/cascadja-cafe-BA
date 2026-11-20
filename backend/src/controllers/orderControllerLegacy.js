import { queryTable } from '../services/dataQueryService.js';

// Orders are the sales line items (order detail).
export async function listOrders(req, res) {
  res.json(await queryTable('sales', req.query));
}
