import { addCustomer } from '../store.js';
import { queryTable } from '../services/dataQueryService.js';

export async function listCustomers(req, res) {
  res.json(await queryTable('customers', req.query));
}

export async function createCustomer(req, res) {
  const customer = await addCustomer(req.body || {});
  res.status(201).json({ customer });
}
