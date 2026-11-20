import { loadData } from '../store.js';

// Row shaping + search/sort/page for the Data Explorer tables.
// Logic copied verbatim from the original routes/api.js.
export const nameOf = (c) => [c.first_name, c.last_name].filter(Boolean).join(' ');

export function buildRows(table, data) {
  const productMap = new Map(data.products.map((p) => [p.id, p]));
  const customerMap = new Map(data.customers.map((c) => [c.id, c]));
  const txnMap = new Map(data.transactions.map((t) => [t.id, t]));

  switch (table) {
    case 'customers':
      return data.customers.map((c) => ({
        id: c.id,
        name: nameOf(c),
        email: c.email,
        city: c.city,
        segment: c.segment,
        joined_at: String(c.joined_at).slice(0, 10),
        loyalty_points: Number(c.loyalty_points) || 0,
      }));
    case 'products':
      return data.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit_price: Number(p.unit_price),
        unit_cost: Number(p.unit_cost),
        type: p.is_room ? 'Room' : 'Cafe',
      }));
    case 'marketing':
      return data.campaigns.map((c) => ({
        id: c.id,
        campaign_name: c.campaign_name,
        channel: c.channel,
        start_date: String(c.start_date).slice(0, 10),
        end_date: String(c.end_date).slice(0, 10),
        spend: Number(c.spend),
        impressions: Number(c.impressions),
        clicks: Number(c.clicks),
        conversions: Number(c.conversions),
        revenue_attributed: Number(c.revenue_attributed),
        roi: Number(c.spend) ? Math.round((Number(c.revenue_attributed) / Number(c.spend)) * 100) / 100 : 0,
      }));
    case 'transactions':
      return data.transactions.map((t) => ({
        id: t.id,
        txn_date: String(t.txn_date).slice(0, 10),
        customer: t.customer_id ? nameOf(customerMap.get(t.customer_id) || {}) || 'Member' : 'Walk-in',
        channel: t.channel,
        payment_method: t.payment_method,
        status: t.status,
        total_amount: Number(t.total_amount),
      }));
    case 'sales':
      return data.sales.map((s) => {
        const p = productMap.get(s.product_id);
        const t = txnMap.get(s.transaction_id);
        return {
          id: s.id,
          sale_date: String(s.sale_date).slice(0, 10),
          transaction_id: s.transaction_id,
          product: p?.name || 'Unknown',
          category: p?.category || '-',
          channel: t?.channel || '-',
          quantity: Number(s.quantity),
          unit_price: Number(s.unit_price),
          line_total: Number(s.line_total),
        };
      });
    default:
      return null;
  }
}

export async function queryTable(table, query = {}) {
  const rows = buildRows(table, await loadData());
  if (!rows) return null;

  const search = String(query.search || '').trim().toLowerCase();
  const sort = String(query.sort || 'id');
  const dir = query.dir === 'desc' ? -1 : 1;
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(query.pageSize) || 12));

  let filtered = rows;
  if (search) {
    filtered = rows.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(search)));
  }
  if (sort && Object.prototype.hasOwnProperty.call(rows[0] || {}, sort)) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  const start = (page - 1) * pageSize;
  return {
    table,
    total: filtered.length,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    rows: filtered.slice(start, start + pageSize),
  };
}

export default queryTable;
