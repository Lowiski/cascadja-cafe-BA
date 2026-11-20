import { loadData, getCounts } from '../store.js';
import { computeDescriptive, computePredictive, computePrescriptive } from '../analytics.js';
import { usingDatabase, pingDatabase } from '../db.js';

export async function health(_req, res) {
  let db = { ok: false, reason: 'demo' };
  try {
    db = await pingDatabase();
  } catch (err) {
    db = { ok: false, reason: err.message };
  }
  res.json({ ok: true, mode: usingDatabase ? 'neon' : 'demo', database: db });
}

export async function meta(_req, res) {
  const counts = await getCounts();
  res.json({
    mode: usingDatabase ? 'neon' : 'demo',
    company: 'Cascadja Cafe',
    currency: 'PHP',
    counts,
    variables: [
      { key: 'customers', label: 'Customers', count: counts.customers },
      { key: 'sales', label: 'Sales (line items)', count: counts.sales },
      { key: 'transactions', label: 'Transactions', count: counts.transactions },
      { key: 'products', label: 'Products', count: counts.products },
      { key: 'marketing', label: 'Marketing campaigns', count: counts.marketing },
    ],
  });
}

export async function descriptive(_req, res) {
  const data = await loadData();
  res.json({ source: data.source, ...computeDescriptive(data) });
}

export async function predictive(_req, res) {
  const data = await loadData();
  const d = computeDescriptive(data);
  res.json({
    source: data.source,
    descriptive: { period: d.period, kpis: d.kpis, monthly: d.monthly },
    ...computePredictive(data, d),
  });
}

export async function prescriptiveGet(req, res) {
  const data = await loadData();
  const d = computeDescriptive(data);
  const input = {
    monthlyBudget: Number(req.query.monthlyBudget) || undefined,
    rateChangePct: Number(req.query.rateChangePct) || 0,
  };
  res.json({ source: data.source, ...computePrescriptive(data, d, input) });
}

export async function prescriptivePost(req, res) {
  const data = await loadData();
  const d = computeDescriptive(data);
  res.json({ source: data.source, ...computePrescriptive(data, d, req.body || {}) });
}
