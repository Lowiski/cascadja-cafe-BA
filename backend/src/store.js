import { generateRealDataset, MENU, ADDONS, DAYPARTS, CATEGORIES, CHANNELS } from './data/generateRealData.js';
import { pool, usingDatabase } from './db.js';

// Active data source: the real Cascadja menu plus generated sample transactions.
// When Neon has the active schema, its menu_items/addons/sales_fact tables win.
// Otherwise the deterministic sample dataset is served. The old cafe-and-inn
// dataset remains in storeLegacy.js as a reference only.
let sampleCache = null;
let neonChecked = false;
let neonResult = null;

function sample() {
  if (!sampleCache) sampleCache = generateRealDataset();
  return sampleCache;
}

// Called after a successful write so the next read sees the owner's new row.
export function invalidateCache() {
  neonChecked = false;
  neonResult = null;
}

function menuRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    priceHot: Number(row.hot_price),
    priceIced: row.iced_price == null ? null : Number(row.iced_price),
    bestseller: Boolean(row.bestseller),
  };
}

function addonRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    bestseller: Boolean(row.bestseller),
  };
}

async function loadFromNeon() {
  if (!usingDatabase || !pool) return null;
  if (neonChecked) return neonResult;
  neonChecked = true;
  try {
    const [salesResult, menuResult, addonResult] = await Promise.all([
      pool.query(`
        SELECT id, order_id, order_date, daypart, channel, product_category,
               item_name, item_price, quantity_sold, addon_name, addon_amount, total_sales
        FROM sales_fact ORDER BY id
      `),
      pool.query('SELECT id, name, category, hot_price, iced_price, bestseller FROM menu_items ORDER BY id'),
      pool.query('SELECT id, name, price, bestseller FROM addons ORDER BY id'),
    ]);

    // A fresh database with no sales should still fall back to the labelled
    // sample data so the analytics never divide by zero.
    if (!salesResult.rows.length) {
      neonResult = null;
      return null;
    }

    const dbMenu = menuResult.rows.map(menuRow);
    const dbAddons = addonResult.rows.map(addonRow);
    const bestsellers = new Map(dbMenu.map((m) => [m.name, m.bestseller]));

    neonResult = {
      source: 'neon',
      seed: null,
      menu: dbMenu.length ? dbMenu : MENU,
      addons: dbAddons.length ? dbAddons : ADDONS,
      sales: salesResult.rows.map((r) => ({
        ...r,
        order_id: Number(r.order_id),
        order_date: String(r.order_date).slice(0, 10),
        item_price: Number(r.item_price),
        quantity_sold: Number(r.quantity_sold),
        addon_amount: Number(r.addon_amount),
        total_sales: Number(r.total_sales),
        bestseller: bestsellers.get(r.item_name) || false,
        addon_name: r.addon_name || '',
      })),
      dayparts: DAYPARTS,
      categories: CATEGORIES,
      channels: CHANNELS,
    };
    return neonResult;
  } catch (err) {
    console.warn(`[data] Neon active tables unavailable (${err.message}); using generated sample data.`);
    neonResult = null;
    return null;
  }
}

export async function loadData() {
  return (await loadFromNeon()) || sample();
}

export async function getCounts() {
  const data = await loadData();
  return {
    sales: data.sales.length,
    orders: new Set(data.sales.map((s) => s.order_id)).size,
    menu: data.menu.length,
    categories: data.categories.length,
    addons: data.addons.length,
    dayparts: data.dayparts.length,
  };
}

export async function getMeta() {
  const data = await loadData();
  return {
    mode: data.source === 'neon' ? 'neon' : 'sample',
    source: data.source,
    company: 'Cascadja Foods and Drinks',
    location: 'Kasadya Park & Play, Calan Road, Cordova, Cebu',
    currency: 'PHP',
    seed: data.seed,
    counts: await getCounts(),
    variables: [
      { key: 'order_date', label: 'Order date / daypart', count: new Set(data.sales.map((s) => s.order_date)).size },
      { key: 'product_category', label: 'Product category', count: data.categories.length },
      { key: 'item_price', label: 'Item price (PHP)', count: new Set(data.sales.map((s) => s.item_price)).size },
      { key: 'quantity_sold', label: 'Quantity sold', count: data.sales.length },
      { key: 'total_sales', label: 'Total sales (PHP)', count: data.sales.length },
      { key: 'channel', label: 'Channel (Dine-in / Foodpanda)', count: data.channels.length },
    ],
  };
}

export { MENU, ADDONS, DAYPARTS, CATEGORIES, CHANNELS };
