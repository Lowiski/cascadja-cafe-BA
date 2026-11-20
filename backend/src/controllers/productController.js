import { queryMenu } from '../services/dataQueryService.js';
import { createMenuItem } from '../services/writeService.js';
import { menu } from './analyticsController.js';

export async function listMenuTable(req, res) {
  res.json(await queryMenu(req.query));
}

export async function addMenuItem(req, res) {
  const created = await createMenuItem(req.body || {});
  res.status(201).json({ item: created });
}

export { menu };
