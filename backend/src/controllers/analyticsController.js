import { loadData, getMeta } from '../store.js';
import { computeDescriptive, computePredictive, computePrescriptive } from '../services/cafeAnalytics.js';
import { usingDatabase, pingDatabase } from '../db.js';

export async function health(_req, res) {
  let db = { ok: false, reason: usingDatabase ? 'new schema not found' : 'generated sample data' };
  try {
    db = await pingDatabase();
  } catch (err) {
    db = { ok: false, reason: err.message };
  }
  const meta = await getMeta();
  res.json({ ok: true, mode: meta.mode, source: meta.source, database: db });
}

export async function meta(_req, res) {
  res.json(await getMeta());
}

export async function descriptive(_req, res) {
  const data = await loadData();
  res.json({ source: data.source, ...computeDescriptive(data) });
}

export async function predictive(_req, res) {
  const data = await loadData();
  const d = computeDescriptive(data);
  res.json({ source: data.source, descriptive: { period: d.period, kpis: d.kpis }, ...computePredictive(data, d) });
}

export async function prescriptive(req, res) {
  const data = await loadData();
  const d = computeDescriptive(data);
  const body = req.method === 'POST' ? req.body || {} : {
    attachTargetPct: Number(req.query.attachTargetPct) || undefined,
    foodpandaGrowthPct: Number(req.query.foodpandaGrowthPct) || undefined,
  };
  res.json({ source: data.source, ...computePrescriptive(data, d, body) });
}

export async function prescriptiveGet(req, res) {
  return prescriptive(req, res);
}

export async function prescriptivePost(req, res) {
  return prescriptive(req, res);
}

export async function menu(_req, res) {
  const data = await loadData();
  res.json({ source: data.source, menu: data.menu, addons: data.addons });
}
