import { queryTable } from '../services/dataQueryService.js';

export async function listCampaigns(req, res) {
  res.json(await queryTable('marketing', req.query));
}
