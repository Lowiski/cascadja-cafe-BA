import { loadData } from '../store.js';

// Query layer for the active sales_fact rows and the menu list.
export function buildSalesRows(data) {
  return data.sales.map((s) => ({
    id: s.id,
    order_id: s.order_id,
    order_date: String(s.order_date).slice(0, 10),
    daypart: s.daypart,
    channel: s.channel,
    product_category: s.product_category,
    item_name: s.item_name,
    bestseller: s.bestseller ? 'Yes' : 'No',
    item_price: Number(s.item_price),
    quantity_sold: Number(s.quantity_sold),
    addon_name: s.addon_name || '—',
    total_sales: Number(s.total_sales),
  }));
}

function paginate(rows, query = {}) {
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
    total: filtered.length,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    rows: filtered.slice(start, start + pageSize),
  };
}

export async function querySales(query = {}) {
  const data = await loadData();
  return { table: 'sales', ...paginate(buildSalesRows(data), query) };
}

export async function queryMenu(query = {}) {
  const data = await loadData();
  const rows = data.menu.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    hot_price: m.priceHot,
    iced_price: m.priceIced ?? '—',
    bestseller: m.bestseller ? 'Yes' : 'No',
  }));
  return { table: 'menu', ...paginate(rows, query) };
}

export default querySales;
