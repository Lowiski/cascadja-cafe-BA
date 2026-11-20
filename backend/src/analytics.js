// Business analytics engine.
// Everything is computed from the five database variables:
// customers, products, transactions, sales (line items) and marketing campaigns.
// Keeping the math here (instead of hard-coded numbers) means the dashboard
// recalculates automatically when the Neon database is re-seeded or edited.

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ELASTICITY = -1.1; // room-rate price elasticity used by the simulator

const round = (n, d = 0) => {
  const f = 10 ** d;
  return Math.round((Number(n) || 0) * f) / f;
};
const sum = (arr, fn) => arr.reduce((s, x) => s + (fn ? fn(x) : x), 0);
const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function monthKey(dateStr) {
  return String(dateStr).slice(0, 7);
}
function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`;
}
function daysInMonthKey(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
function nextMonthKey(key, offset) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + offset, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// ------------------------------------------------------------- statistics
export function linearRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return { n, slope: 0, intercept: 0, r2: 0, rmse: 0, mape: 0, residualStd: 0 };
  const mx = sum(xs) / n;
  const my = sum(ys) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
    syy += (ys[i] - my) ** 2;
  }
  const slope = sxx ? sxy / sxx : 0;
  const intercept = my - slope * mx;
  const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0;
  let sse = 0;
  let mapeSum = 0;
  let mapeCount = 0;
  for (let i = 0; i < n; i++) {
    const pred = intercept + slope * xs[i];
    sse += (ys[i] - pred) ** 2;
    if (ys[i] !== 0) {
      mapeSum += Math.abs((ys[i] - pred) / ys[i]);
      mapeCount++;
    }
  }
  return {
    n,
    slope,
    intercept,
    r2,
    rmse: Math.sqrt(sse / n),
    mape: mapeCount ? (mapeSum / mapeCount) * 100 : 0,
    residualStd: n > 2 ? Math.sqrt(sse / (n - 2)) : 0,
  };
}

export function correlation(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ma = sum(a.slice(0, n)) / n;
  const mb = sum(b.slice(0, n)) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

// ------------------------------------------------------------- descriptive
export function computeDescriptive(data) {
  const { customers, products, campaigns, transactions, sales, roomInventory = 4 } = data;
  const productMap = new Map(products.map((p) => [p.id, p]));
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const completed = transactions.filter((t) => t.status !== 'Cancelled');
  const completedIds = new Set(completed.map((t) => t.id));
  const completedSales = sales.filter((s) => completedIds.has(s.transaction_id));

  const totalRevenue = sum(completed, (t) => Number(t.total_amount));
  const totalCogs = sum(completedSales, (s) => {
    const p = productMap.get(s.product_id);
    return p ? Number(p.unit_cost) * Number(s.quantity) : 0;
  });
  const marketingSpend = sum(campaigns, (c) => Number(c.spend));
  const attributed = sum(campaigns, (c) => Number(c.revenue_attributed));
  const conversions = sum(campaigns, (c) => Number(c.conversions));

  // Monthly roll-up ------------------------------------------------------
  const keys = [...new Set(completed.map((t) => monthKey(t.txn_date)))].sort();
  const spendKeys = new Set(campaigns.map((c) => monthKey(c.start_date)));
  const allKeys = [...new Set([...keys, ...spendKeys])].sort();

  const monthly = allKeys.map((key) => {
    const monthTxns = completed.filter((t) => monthKey(t.txn_date) === key);
    const monthSales = completedSales.filter((s) => monthKey(s.sale_date) === key);
    const monthCampaigns = campaigns.filter((c) => monthKey(c.start_date) === key);
    const roomNights = sum(
      monthSales.filter((s) => productMap.get(s.product_id)?.is_room),
      (s) => Number(s.quantity),
    );
    const available = roomInventory * daysInMonthKey(key);
    const revenue = sum(monthTxns, (t) => Number(t.total_amount));
    const spend = sum(monthCampaigns, (c) => Number(c.spend));
    const attr = sum(monthCampaigns, (c) => Number(c.revenue_attributed));
    return {
      month: key,
      label: monthLabel(key),
      revenue: round(revenue),
      transactions: monthTxns.length,
      avgOrder: monthTxns.length ? round(revenue / monthTxns.length) : 0,
      marketingSpend: round(spend),
      attributedRevenue: round(attr),
      conversions: sum(monthCampaigns, (c) => Number(c.conversions)),
      roomNights,
      occupancy: round(pct(roomNights, available), 1),
      newCustomers: customers.filter((c) => monthKey(c.joined_at) === key).length,
      cogs: round(sum(monthSales, (s) => (productMap.get(s.product_id)?.unit_cost || 0) * s.quantity)),
    };
  });

  const periodDays = sum(allKeys, (k) => daysInMonthKey(k)) || 365;
  const totalRoomNights = sum(
    completedSales.filter((s) => productMap.get(s.product_id)?.is_room),
    (s) => Number(s.quantity),
  );
  const roomRevenue = sum(
    completedSales.filter((s) => productMap.get(s.product_id)?.is_room),
    (s) => Number(s.line_total),
  );
  const cafeRevenue = totalRevenue - roomRevenue;

  // Channel / category / product mix ------------------------------------
  const channelMap = new Map();
  for (const t of completed) {
    const row = channelMap.get(t.channel) || { channel: t.channel, revenue: 0, transactions: 0 };
    row.revenue += Number(t.total_amount);
    row.transactions += 1;
    channelMap.set(t.channel, row);
  }
  const byChannel = [...channelMap.values()]
    .map((r) => ({ ...r, revenue: round(r.revenue), share: round(pct(r.revenue, totalRevenue), 1), avgOrder: round(r.revenue / r.transactions) }))
    .sort((a, b) => b.revenue - a.revenue);

  const categoryMap = new Map();
  for (const s of completedSales) {
    const p = productMap.get(s.product_id);
    if (!p) continue;
    const row = categoryMap.get(p.category) || { category: p.category, revenue: 0, units: 0 };
    row.revenue += Number(s.line_total);
    row.units += Number(s.quantity);
    categoryMap.set(p.category, row);
  }
  const byCategory = [...categoryMap.values()]
    .map((r) => ({ ...r, revenue: round(r.revenue), share: round(pct(r.revenue, sum([...categoryMap.values()], (x) => x.revenue)), 1) }))
    .sort((a, b) => b.revenue - a.revenue);

  const productAgg = new Map();
  for (const s of completedSales) {
    const p = productMap.get(s.product_id);
    if (!p) continue;
    const row = productAgg.get(p.id) || { id: p.id, name: p.name, category: p.category, isRoom: p.is_room, units: 0, revenue: 0 };
    row.units += Number(s.quantity);
    row.revenue += Number(s.line_total);
    productAgg.set(p.id, row);
  }
  const allProducts = [...productAgg.values()].map((r) => ({ ...r, revenue: round(r.revenue) }));
  const topProducts = allProducts.filter((p) => !p.isRoom).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const roomMix = allProducts.filter((p) => p.isRoom).sort((a, b) => b.revenue - a.revenue);

  // Customer analytics ---------------------------------------------------
  const txnsByCustomer = new Map();
  for (const t of completed) {
    if (!t.customer_id) continue;
    txnsByCustomer.set(t.customer_id, (txnsByCustomer.get(t.customer_id) || 0) + 1);
  }
  const activeCustomerIds = [...txnsByCustomer.keys()];
  const repeatCustomers = activeCustomerIds.filter((id) => txnsByCustomer.get(id) >= 2).length;

  const segmentMap = new Map();
  for (const t of completed) {
    const cust = t.customer_id ? customerMap.get(t.customer_id) : null;
    const segment = cust ? cust.segment : 'Walk-in';
    const row = segmentMap.get(segment) || { segment, revenue: 0, transactions: 0, customers: 0 };
    row.revenue += Number(t.total_amount);
    row.transactions += 1;
    segmentMap.set(segment, row);
  }
  for (const c of customers) {
    const row = segmentMap.get(c.segment);
    if (row) row.customers += 1;
  }
  const bySegment = [...segmentMap.values()]
    .map((r) => ({ ...r, revenue: round(r.revenue), share: round(pct(r.revenue, totalRevenue), 1), avgSpend: round(r.revenue / r.transactions) }))
    .sort((a, b) => b.revenue - a.revenue);

  const cityMap = new Map();
  for (const c of customers) {
    const row = cityMap.get(c.city) || { city: c.city, customers: 0, revenue: 0 };
    row.customers += 1;
    cityMap.set(c.city, row);
  }
  for (const t of completed) {
    if (!t.customer_id) continue;
    const c = customerMap.get(t.customer_id);
    if (!c) continue;
    const row = cityMap.get(c.city);
    if (row) row.revenue += Number(t.total_amount);
  }
  const byCity = [...cityMap.values()].map((r) => ({ ...r, revenue: round(r.revenue) })).sort((a, b) => b.revenue - a.revenue);

  const paymentMap = new Map();
  for (const t of completed) {
    const row = paymentMap.get(t.payment_method) || { method: t.payment_method, transactions: 0, revenue: 0 };
    row.transactions += 1;
    row.revenue += Number(t.total_amount);
    paymentMap.set(t.payment_method, row);
  }
  const byPayment = [...paymentMap.values()].map((r) => ({ ...r, revenue: round(r.revenue) })).sort((a, b) => b.revenue - a.revenue);

  const dowMap = new Map(DOW.map((d) => [d, { day: d, transactions: 0, revenue: 0 }]));
  for (const t of completed) {
    const dow = DOW[new Date(`${t.txn_date}T00:00:00Z`).getUTCDay()];
    const row = dowMap.get(dow);
    row.transactions += 1;
    row.revenue += Number(t.total_amount);
  }
  const byDayOfWeek = [...dowMap.values()].map((r) => ({ ...r, revenue: round(r.revenue) }));

  // Marketing channel efficiency ----------------------------------------
  const marketingMap = new Map();
  for (const c of campaigns) {
    const row = marketingMap.get(c.channel) || {
      channel: c.channel, spend: 0, impressions: 0, clicks: 0, conversions: 0, attributedRevenue: 0, campaigns: 0,
    };
    row.spend += Number(c.spend);
    row.impressions += Number(c.impressions);
    row.clicks += Number(c.clicks);
    row.conversions += Number(c.conversions);
    row.attributedRevenue += Number(c.revenue_attributed);
    row.campaigns += 1;
    marketingMap.set(c.channel, row);
  }
  const marketingByChannel = [...marketingMap.values()]
    .map((r) => ({
      ...r,
      spend: round(r.spend),
      attributedRevenue: round(r.attributedRevenue),
      roi: round(r.attributedRevenue / r.spend, 2),
      ctr: round(pct(r.clicks, r.impressions), 2),
      cvr: round(pct(r.conversions, r.clicks), 2),
      cpa: round(r.spend / r.conversions),
      cpc: round(r.spend / r.clicks, 2),
      revenuePerConversion: round(r.attributedRevenue / r.conversions),
      shareOfSpend: round(pct(r.spend, marketingSpend), 1),
    }))
    .sort((a, b) => b.roi - a.roi);

  const roomAttachTxns = completed.filter((t) => {
    if (t.channel !== 'Room Stay') return false;
    const lines = completedSales.filter((s) => s.transaction_id === t.id);
    return lines.some((s) => !productMap.get(s.product_id)?.is_room);
  }).length;
  const roomTxns = completed.filter((t) => t.channel === 'Room Stay').length;

  const busiestDay = [...byDayOfWeek].sort((a, b) => b.transactions - a.transactions)[0];
  const txnPerDay = completed.length / periodDays;

  return {
    generatedAt: new Date().toISOString(),
    period: {
      from: allKeys[0],
      to: allKeys[allKeys.length - 1],
      months: allKeys.length,
      days: periodDays,
      label: `${monthLabel(allKeys[0])} - ${monthLabel(allKeys[allKeys.length - 1])}`,
    },
    kpis: {
      totalRevenue: round(totalRevenue),
      grossProfit: round(totalRevenue - totalCogs),
      grossMargin: round(pct(totalRevenue - totalCogs, totalRevenue), 1),
      transactions: completed.length,
      avgOrder: round(totalRevenue / (completed.length || 1)),
      customers: customers.length,
      activeCustomers: activeCustomerIds.length,
      repeatCustomers,
      repeatRate: round(pct(repeatCustomers, activeCustomerIds.length), 1),
      marketingSpend: round(marketingSpend),
      attributedRevenue: round(attributed),
      marketingRoi: round(attributed / marketingSpend, 2),
      conversions,
      roomNights: totalRoomNights,
      occupancy: round(pct(totalRoomNights, roomInventory * periodDays), 1),
      adr: round(roomRevenue / (totalRoomNights || 1)),
      roomRevenue: round(roomRevenue),
      cafeRevenue: round(cafeRevenue),
      roomShare: round(pct(roomRevenue, totalRevenue), 1),
      roomAttachRate: round(pct(roomAttachTxns, roomTxns), 1),
      topChannel: byChannel[0]?.channel || '-',
      topProduct: topProducts[0]?.name || '-',
      busiestDay: busiestDay?.day || '-',
      transactionsPerDay: round(txnPerDay, 1),
    },
    monthly,
    byChannel,
    byCategory,
    topProducts,
    roomMix,
    bySegment,
    byCity,
    byPayment,
    byDayOfWeek,
    marketingByChannel,
    unitEconomics: {
      roomInventory,
      adr: round(roomRevenue / (totalRoomNights || 1)),
      revpar: round(pct(totalRoomNights, roomInventory * periodDays) * (roomRevenue / (totalRoomNights || 1)) / 100),
      roomAttachRate: round(pct(roomAttachTxns, roomTxns), 1),
      cafeAvgTicket: round(cafeRevenue / (completed.length - roomTxns || 1)),
      cogsRatio: round(pct(totalCogs, totalRevenue), 1),
    },
  };
}

// --------------------------------------------------------------- predictive
export function computePredictive(data, descriptive) {
  const d = descriptive || computeDescriptive(data);
  const months = d.monthly;
  const xs = months.map((m) => m.marketingSpend);
  const ys = months.map((m) => m.revenue);
  const reg = linearRegression(xs, ys);

  const actualVsFitted = months.map((m, i) => ({
    label: m.label,
    actual: m.revenue,
    fitted: round(reg.intercept + reg.slope * xs[i]),
    spend: m.marketingSpend,
  }));

  const lastSpend = sum(xs.slice(-3)) / Math.min(3, xs.length);
  const forecast = [1, 2, 3].map((step) => {
    const spend = round(lastSpend * 1.03 ** step);
    const revenue = round(reg.intercept + reg.slope * spend);
    const band = round(1.96 * reg.residualStd);
    return {
      month: nextMonthKey(months[months.length - 1].month, step),
      label: monthLabel(nextMonthKey(months[months.length - 1].month, step)),
      spend,
      revenue: Math.max(0, revenue),
      lower: Math.max(0, revenue - band),
      upper: revenue + band,
    };
  });

  // Occupancy: a 3-month moving average is a transparent, defensible forecast.
  const occ = months.map((m) => m.occupancy);
  const recent = occ.slice(-3);
  const occAvg = recent.length ? sum(recent) / recent.length : 0;
  const priorAvg = sum(occ.slice(-6, -3)) / 3 || occAvg;
  // Damp the recent trend by half so a strong quarter does not project a
  // straight line to unrealistic occupancy.
  const occTrend = (occAvg - priorAvg) * 0.5;
  const occupancyForecast = [1, 2, 3].map((step) => ({
    month: nextMonthKey(months[months.length - 1].month, step),
    label: monthLabel(nextMonthKey(months[months.length - 1].month, step)),
    occupancy: round(clamp(occAvg + occTrend * step, 5, 80), 1),
  }));

  const driverDefs = [
    ['Marketing spend', months.map((m) => m.marketingSpend)],
    ['Conversions', months.map((m) => m.conversions)],
    ['Transactions', months.map((m) => m.transactions)],
    ['Room nights', months.map((m) => m.roomNights)],
    ['New customers', months.map((m) => m.newCustomers)],
    ['Occupancy %', months.map((m) => m.occupancy)],
  ];
  const drivers = driverDefs
    .map(([driver, values]) => ({ driver, correlation: round(correlation(values, ys), 2) }))
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

  const nextMonth = forecast[0];

  return {
    model: {
      name: 'Simple linear regression',
      equation: `Revenue = ${round(reg.intercept).toLocaleString()} + ${round(reg.slope, 2).toLocaleString()} x Marketing spend`,
      slope: round(reg.slope, 2),
      intercept: round(reg.intercept),
      r2: round(reg.r2, 3),
      n: reg.n,
      mape: round(reg.mape, 1),
      rmse: round(reg.rmse),
      residualStd: round(reg.residualStd),
      interpretation:
        reg.slope > 0
          ? `Every additional PHP 1,000 of monthly marketing spend is associated with about PHP ${round(reg.slope * 1000).toLocaleString()} of monthly revenue. Marketing spend explains roughly ${round(reg.r2 * 100)}% of the month-to-month revenue variation.`
          : 'Marketing spend shows no positive linear relationship with revenue in this period.',
    },
    actualVsFitted,
    forecast,
    occupancyForecast,
    drivers,
    nextMonth,
    trainWindow: `${months[0].label} - ${months[months.length - 1].label}`,
  };
}

// -------------------------------------------------------------- prescriptive
function allocateBudget(channels, budget) {
  // channels: [{channel, currentSpend, roi, cpa, revenuePerConversion}]
  const weights = channels.map((c) => Math.max(0.2, c.roi) ** 1.15);
  const weightSum = sum(weights);
  let remaining = budget;
  const allocation = channels.map(() => null);

  const open = new Set(channels.map((_, i) => i));
  for (let guard = 0; guard < 40 && open.size; guard++) {
    const openWeight = sum([...open], (i) => weights[i]);
    let changed = false;
    for (const i of [...open]) {
      const share = openWeight ? (weights[i] / openWeight) * remaining : 0;
      const min = channels[i].minSpend;
      const max = channels[i].maxSpend;
      if (share <= min) {
        allocation[i] = min;
        remaining -= min;
        open.delete(i);
        changed = true;
      } else if (share >= max) {
        allocation[i] = max;
        remaining -= max;
        open.delete(i);
        changed = true;
      }
    }
    if (!changed) {
      for (const i of open) allocation[i] = openWeight ? (weights[i] / openWeight) * remaining : 0;
      open.clear();
    }
  }
  // Round to the nearest peso and fix any rounding drift on the largest line.
  const rounded = allocation.map((v) => Math.max(0, Math.round(v)));
  const drift = budget - sum(rounded);
  const largest = rounded.indexOf(Math.max(...rounded));
  if (largest >= 0) rounded[largest] += drift;
  return rounded;
}

export function computePrescriptive(data, descriptive, input = {}) {
  const d = descriptive || computeDescriptive(data);
  const { marketingByChannel } = d;
  const monthsCount = Math.max(1, d.period.months);

  const channels = marketingByChannel.map((c) => {
    const currentSpend = c.spend / monthsCount;
    const roi = c.roi || 0;
    const cpa = c.cpa || 1;
    const revenuePerConversion = c.revenuePerConversion || 0;
    return {
      channel: c.channel,
      currentSpend: round(currentSpend),
      minSpend: Math.max(1000, round(currentSpend * 0.4)),
      maxSpend: Math.max(3500, round(currentSpend * 2.2)),
      roi,
      cpa,
      revenuePerConversion,
      conversions: c.conversions,
    };
  });

  const avgMonthlySpend = round(sum(channels, (c) => c.currentSpend));
  const budget = clamp(Number(input.monthlyBudget) || avgMonthlySpend, 5000, 500000);
  const rateChangePct = clamp(Number(input.rateChangePct) || 0, -30, 30);

  // Make sure the budget can satisfy the minimums / maximums.
  const minTotal = sum(channels, (c) => c.minSpend);
  const maxTotal = sum(channels, (c) => c.maxSpend);
  const effectiveBudget = clamp(budget, Math.max(5000, minTotal), Math.max(minTotal, Math.min(maxTotal, 500000)));

  const allocation = allocateBudget(channels, effectiveBudget);
  const rows = channels.map((c, i) => {
    const recommendedSpend = allocation[i];
    // Diminishing returns: pushing a channel far above its historical spend
    // makes each additional peso slightly less productive.
    const ratio = c.currentSpend ? recommendedSpend / c.currentSpend : 1;
    const efficiency = 1 - clamp(0.18 * Math.max(0, ratio - 1), 0, 0.35);
    const projectedConversions = c.cpa ? (recommendedSpend / c.cpa) * efficiency : 0;
    const projectedRevenue = projectedConversions * c.revenuePerConversion;
    const baselineSpend = avgMonthlySpend ? (c.currentSpend / avgMonthlySpend) * effectiveBudget : 0;
    const baselineRevenue = baselineSpend * c.roi;
    return {
      channel: c.channel,
      currentSpend: c.currentSpend,
      recommendedSpend,
      change: recommendedSpend - c.currentSpend,
      changePct: c.currentSpend ? round(pct(recommendedSpend - c.currentSpend, c.currentSpend), 1) : 0,
      roi: c.roi,
      cpa: round(c.cpa),
      projectedConversions: round(projectedConversions),
      projectedRevenue: round(projectedRevenue),
      baselineRevenue: round(baselineRevenue),
    };
  }).sort((a, b) => b.recommendedSpend - a.recommendedSpend);

  const projectedAttributed = sum(rows, (r) => r.projectedRevenue);
  const baselineAttributed = sum(rows, (r) => r.baselineRevenue);
  const liftPct = baselineAttributed ? ((projectedAttributed - baselineAttributed) / baselineAttributed) * 100 : 0;

  // Translate attributed revenue into a whole-business scenario ----------
  // The predictive regression supplies the total-revenue baseline for the
  // proposed budget; the allocation above decides how efficiently it is spent.
  const reg = linearRegression(
    d.monthly.map((m) => m.marketingSpend),
    d.monthly.map((m) => m.revenue),
  );
  const modelRevenue = Math.max(0, reg.intercept + reg.slope * effectiveBudget);
  const roomShare = d.kpis.roomShare / 100;
  const cafeShare = 1 - roomShare;
  const baseRoom = modelRevenue * roomShare;
  const baseCafe = modelRevenue * cafeShare;

  const r = rateChangePct / 100;
  const rateEffect = (1 + r) * (1 + ELASTICITY * r) - 1; // revenue change after elasticity
  const roomRevenue = baseRoom * (1 + rateEffect);
  const projectedRevenue = baseCafe + roomRevenue;

  const cogsRatio = (d.unitEconomics?.cogsRatio || 38) / 100;
  const fixedCost = 58000; // rent, utilities, salaries, etc. (monthly estimate)
  const scenarioCogs = projectedRevenue * cogsRatio;
  const profit = projectedRevenue - scenarioCogs - effectiveBudget - fixedCost;
  const margin = pct(profit, projectedRevenue);

  const baseOccupancy = d.kpis.occupancy || 0;
  const scenarioOccupancy = clamp(baseOccupancy * (1 + ELASTICITY * r), 5, 98);
  const adr = d.unitEconomics.adr || 0;

  // Room-rate recommendation
  let suggestedChangePct;
  let pricingRationale;
  if (baseOccupancy >= 70) {
    suggestedChangePct = 8;
    pricingRationale = `Occupancy is already ${baseOccupancy}%, above the 70% target. A modest rate increase should lift RevPAR without hurting demand.`;
  } else if (baseOccupancy >= 55) {
    suggestedChangePct = 4;
    pricingRationale = `Occupancy is healthy at ${baseOccupancy}%. A small increase captures extra value from strong demand.`;
  } else if (baseOccupancy >= 40) {
    suggestedChangePct = 1;
    pricingRationale = `Occupancy is ${baseOccupancy}%, close to the 45-55% comfort zone. Keep rates stable and focus on weekend packages.`;
  } else {
    suggestedChangePct = -7;
    pricingRationale = `Occupancy is only ${baseOccupancy}%. A weekday rate cut and bundled cafe credits should fill rooms faster than a price increase.`;
  }
  const suggestedRate = round(adr * (1 + suggestedChangePct / 100));
  const pricingUplift = round(
    d.kpis.roomRevenue / monthsCount * (((1 + suggestedChangePct / 100) * (1 + ELASTICITY * (suggestedChangePct / 100))) - 1),
  );

  const attach = d.kpis.roomAttachRate || 0;
  const roomTxns = (d.byChannel.find((c) => c.channel === 'Room Stay')?.transactions || 0) / monthsCount;
  const attachOpportunity = round((0.15 * roomTxns) * d.unitEconomics.cafeAvgTicket);

  const staffNeeded = Math.max(2, Math.ceil(d.kpis.transactionsPerDay / 7));

  const best = rows.reduce((a, b) => (b.roi > a.roi ? b : a), rows[0]);
  const worst = rows.reduce((a, b) => (b.roi < a.roi ? b : a), rows[0]);
  const gain = rows.filter((r2) => r2.change > 0).slice(0, 2);
  const moved = sum(rows.filter((r2) => r2.change > 0), (r2) => r2.change);

  const recommendations = [
    {
      tag: 'Marketing mix',
      title: `Move budget toward ${best.channel}`,
      detail: `${best.channel} returns PHP ${best.roi.toFixed(2)} for every PHP 1 spent, versus PHP ${worst.roi.toFixed(2)} for ${worst.channel}. Shift about PHP ${round(moved).toLocaleString()} into ${gain.map((g) => g.channel).join(' and ') || best.channel}, funded mainly by trimming ${worst.channel}.`,
      impact: `Projected attributed revenue: PHP ${round(projectedAttributed).toLocaleString()} vs PHP ${round(baselineAttributed).toLocaleString()} (+${round(liftPct, 1)}%)`,
    },
    {
      tag: 'Room pricing',
      title: `Set average room rate near PHP ${suggestedRate.toLocaleString()}`,
      detail: pricingRationale,
      impact: `Estimated monthly room-revenue change: PHP ${pricingUplift >= 0 ? '+' : ''}${pricingUplift.toLocaleString()}`,
    },
    {
      tag: 'Cafe cross-sell',
      title: `Raise room-to-cafe attach rate from ${attach}%`,
      detail: `Only ${attach}% of room stays include a cafe item. Offer a breakfast-and-coffee bundle or a welcome-drink voucher at check-in to lift this toward 60%.`,
      impact: `Roughly PHP ${attachOpportunity.toLocaleString()} extra cafe revenue per month at +15 percentage points of attach.`,
    },
    {
      tag: 'Operations',
      title: `${staffNeeded} service staff on the floor at peak`,
      detail: `The cafe averages ${d.kpis.transactionsPerDay} transactions per day, with ${d.kpis.busiestDay} as the busiest day. Schedule ${staffNeeded} staff for peak shifts and ${Math.max(1, staffNeeded - 1)} for slow weekdays.`,
      impact: 'Keeps service speed aligned with demand while controlling labor cost.',
    },
    {
      tag: 'Menu',
      title: `Feature ${d.kpis.topProduct}`,
      detail: `${d.kpis.topProduct} is the top cafe product by revenue. Build a bundle with a pastry or upsell it at the counter to protect the cafe's contribution while room revenue dominates.`,
      impact: `Cafe contributes ${100 - d.kpis.roomShare}% of total revenue, so small ticket gains matter.`,
    },
  ];

  return {
    input: { monthlyBudget: budget, rateChangePct },
    effectiveBudget,
    currentMonthlySpend: avgMonthlySpend,
    optimization: {
      budget: effectiveBudget,
      projectedAttributedRevenue: round(projectedAttributed),
      baselineAttributedRevenue: round(baselineAttributed),
      liftPct: round(liftPct, 1),
      projectedRoi: round(projectedAttributed / (effectiveBudget || 1), 2),
      allocation: rows,
    },
    scenario: {
      projectedMonthlyRevenue: round(projectedRevenue),
      modelRevenue: round(modelRevenue),
      modelR2: round(reg.r2, 3),
      cafeRevenue: round(baseCafe),
      roomRevenue: round(roomRevenue),
      marketingSpend: effectiveBudget,
      cogs: round(scenarioCogs),
      fixedCost,
      estimatedProfit: round(profit),
      margin: round(margin, 1),
      occupancy: round(scenarioOccupancy, 1),
      adr: round(adr * (1 + r)),
      roomRateChangePct: rateChangePct,
    },
    roomPricing: {
      currentAdr: round(adr),
      occupancy: baseOccupancy,
      suggestedRate,
      suggestedChangePct,
      rationale: pricingRationale,
    },
    recommendations,
    assumptions: [
      'Revenue is attributed to campaigns as recorded in the marketing table (last-click style).',
      `Room-rate demand elasticity is assumed to be ${ELASTICITY}.`,
      `Fixed monthly operating cost is estimated at PHP ${fixedCost.toLocaleString()}; COGS is ${round(cogsRatio * 100, 1)}% of revenue.`,
    ],
  };
}

export function buildBundle(data) {
  const descriptive = computeDescriptive(data);
  const predictive = computePredictive(data, descriptive);
  return { descriptive, predictive };
}
