// Analytics engine for Cascadja Foods and Drinks.
// Works from the five real variables + channel:
// order_date/daypart, product_category, item_price, quantity_sold, total_sales, channel.
import { round, sum, pct, clamp, linearRegression } from '../utils/calculations.js';

const FOOD_CATEGORIES = new Set([
  'Rice Meal', 'Pasta', 'Snacks', 'Tiramisu', 'Croffles', 'Bread & Salad',
]);
const DAYPARTS = ['Morning', 'Lunch', 'Afternoon', 'Evening', 'Late Night'];

const groupBy = (rows, keyFn) => {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
};

export function computeDescriptive(data) {
  const { sales = [], period: metaPeriod } = data;
  const orders = new Set(sales.map((s) => s.order_id)).size || 1;
  const totalSales = sum(sales, (s) => Number(s.total_sales));
  const units = sum(sales, (s) => Number(s.quantity_sold));
  const itemRevenue = sum(sales, (s) => Number(s.item_price) * Number(s.quantity_sold));
  const addonRevenue = totalSales - itemRevenue;
  const dates = [...new Set(sales.map((s) => s.order_date))].sort();
  const days = dates.length || 1;

  const groupAgg = (keyFn) => {
    const map = new Map();
    for (const s of sales) {
      const key = keyFn(s);
      const row = map.get(key) || { key, revenue: 0, units: 0, lines: 0, orders: new Set() };
      row.revenue += Number(s.total_sales);
      row.units += Number(s.quantity_sold);
      row.lines += 1;
      row.orders.add(s.order_id);
      map.set(key, row);
    }
    return [...map.values()]
      .map((r) => ({
        key: r.key,
        revenue: round(r.revenue),
        units: r.units,
        lines: r.lines,
        orders: r.orders.size,
        share: round(pct(r.revenue, totalSales), 1),
        avgOrder: round(r.revenue / r.orders.size),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const byCategory = groupAgg((s) => s.product_category).map((r) => ({ ...r, category: r.key, key: undefined }));
  const byChannel = groupAgg((s) => s.channel).map((r) => ({ ...r, channel: r.key, key: undefined }));
  const byDaypart = groupAgg((s) => s.daypart)
    .map((r) => ({ ...r, daypart: r.key, key: undefined }))
    .sort((a, b) => DAYPARTS.indexOf(a.daypart) - DAYPARTS.indexOf(b.daypart));

  const itemMap = new Map();
  for (const s of sales) {
    const row = itemMap.get(s.item_name) || {
      name: s.item_name, category: s.product_category, bestseller: s.bestseller, revenue: 0, units: 0,
    };
    row.revenue += Number(s.total_sales);
    row.units += Number(s.quantity_sold);
    itemMap.set(s.item_name, row);
  }
  const topItems = [...itemMap.values()]
    .map((r) => ({ ...r, revenue: round(r.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);

  const addonMap = new Map();
  for (const s of sales) {
    if (!s.addon_name) continue;
    const row = addonMap.get(s.addon_name) || { name: s.addon_name, count: 0, revenue: 0 };
    row.count += 1;
    row.revenue += Number(s.addon_amount);
    addonMap.set(s.addon_name, row);
  }
  const addons = [...addonMap.values()].sort((a, b) => b.count - a.count);

  const dailyMap = new Map();
  for (const s of sales) {
    const row = dailyMap.get(s.order_date) || { date: s.order_date, revenue: 0, orders: new Set(), units: 0 };
    row.revenue += Number(s.total_sales);
    row.orders.add(s.order_id);
    row.units += Number(s.quantity_sold);
    dailyMap.set(s.order_date, row);
  }
  const daily = [...dailyMap.values()]
    .map((r) => ({ date: r.date, revenue: round(r.revenue), orders: r.orders.size, units: r.units }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const foodRevenue = sum(sales, (s) => (FOOD_CATEGORIES.has(s.product_category) ? Number(s.total_sales) : 0));
  const bestsellerRevenue = sum(sales, (s) => (s.bestseller ? Number(s.total_sales) : 0));
  const weekdayCounts = groupBy(sales.map((s) => s.order_date).map((d) => new Date(`${d}T00:00:00Z`).getUTCDay()), (d) => d);
  const busiestWeekday = [...weekdayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    generatedAt: new Date().toISOString(),
    period: metaPeriod || {
      from: dates[0],
      to: dates[dates.length - 1],
      days,
      label: `${dates[0]} - ${dates[dates.length - 1]}`,
    },
    kpis: {
      totalSales: round(totalSales),
      orders,
      avgOrder: round(totalSales / orders),
      itemsSold: units,
      lines: sales.length,
      avgItemPrice: round(itemRevenue / units),
      addonRevenue: round(addonRevenue),
      addonAttachRate: round(pct(sales.filter((s) => s.addon_name).length, sales.length), 1),
      bestsellerShare: round(pct(bestsellerRevenue, totalSales), 1),
      foodShare: round(pct(foodRevenue, totalSales), 1),
      drinkShare: round(pct(totalSales - foodRevenue, totalSales), 1),
      dineInShare: round(pct(sum(byChannel.filter((c) => c.channel === 'Dine-in'), (c) => c.revenue), totalSales), 1),
      foodpandaShare: round(pct(sum(byChannel.filter((c) => c.channel === 'Foodpanda'), (c) => c.revenue), totalSales), 1),
      busiestDaypart: [...byDaypart].sort((a, b) => b.revenue - a.revenue)[0]?.daypart || '-',
      busiestDay: WEEKDAYS[busiestWeekday] || '-',
      salesPerDay: round(totalSales / days),
      ordersPerDay: round(orders / days, 1),
    },
    byCategory,
    byChannel,
    byDaypart,
    topItems,
    addons,
    daily,
  };
}

export function computePredictive(data, descriptive) {
  const d = descriptive || computeDescriptive(data);
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const xs = d.daily.map((_, i) => i + 1);
  const ys = d.daily.map((r) => r.revenue);
  const reg = linearRegression(xs, ys);
  const overallMean = ys.length ? sum(ys) / ys.length : 0;

  // Weekday seasonal averages: cafés repeat a weekly pattern more reliably
  // than a straight calendar-day trend. This is the day-of-week naive model.
  const groups = new Map();
  d.daily.forEach((r) => {
    const w = new Date(`${r.date}T00:00:00Z`).getUTCDay();
    if (!groups.has(w)) groups.set(w, []);
    groups.get(w).push(r.revenue);
  });
  const stats = new Map();
  groups.forEach((values, w) => {
    const mean = sum(values) / values.length;
    const variance = sum(values, (v) => (v - mean) ** 2) / Math.max(1, values.length - 1);
    stats.set(w, { mean, std: Math.sqrt(variance) });
  });
  const forDate = (dateStr) => {
    const w = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
    return stats.get(w) || { mean: overallMean, std: 0 };
  };

  let sse = 0;
  let sst = 0;
  let mapeSum = 0;
  let mapeCount = 0;
  d.daily.forEach((r) => {
    const pred = forDate(r.date).mean;
    sse += (r.revenue - pred) ** 2;
    sst += (r.revenue - overallMean) ** 2;
    if (r.revenue) {
      mapeSum += Math.abs((r.revenue - pred) / r.revenue);
      mapeCount++;
    }
  });
  const r2 = sst ? Math.max(0, 1 - sse / sst) : 0;
  const rmse = Math.sqrt(sse / Math.max(1, ys.length));
  const residualStd = Math.sqrt(sse / Math.max(1, ys.length - 7));
  const band = round(1.96 * residualStd);
  const last = d.daily.length;

  const forecast = [1, 2, 3, 4, 5, 6, 7].map((step) => {
    const date = new Date(`${d.daily[last - 1].date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + step);
    const dateStr = date.toISOString().slice(0, 10);
    const revenue = Math.max(0, round(forDate(dateStr).mean));
    return {
      date: dateStr,
      weekday: WEEKDAYS[date.getUTCDay()],
      forecast: revenue,
      lower: Math.max(0, revenue - band),
      upper: revenue + band,
    };
  });

  const daypartForecast = d.byDaypart.map((p) => ({
    daypart: p.daypart,
    revenuePerDay: round(p.revenue / d.period.days),
    ordersPerDay: round(p.orders / d.period.days, 1),
  }));

  const weekendMean = [0, 6].length
    ? sum([0, 6], (w) => (stats.get(w)?.mean || 0)) / 2
    : 0;
  const weekdayMean = [1, 2, 3, 4, 5].reduce((s, w) => s + (stats.get(w)?.mean || 0), 0) / 5;

  return {
    model: {
      name: 'Weekday seasonal average (day-of-week naive)',
      equation: `Forecast(day) = mean historical sales for that weekday · band ±${band.toLocaleString()} PHP`,
      slope: round(reg.slope, 2),
      intercept: round(reg.intercept),
      r2: round(r2, 3),
      n: reg.n,
      mape: mapeCount ? round((mapeSum / mapeCount) * 100, 1) : 0,
      rmse: round(rmse),
      interpretation:
        `Weekends are the clearest repeating pattern: Sat–Sun average ${round(weekendMean).toLocaleString()} PHP per day versus ${round(weekdayMean).toLocaleString()} PHP on weekdays. The weekday model explains about ${round(r2 * 100)}% of daily variation — honest, but modest, because no promotions or holidays are in the data yet.`,
    },
    forecast,
    daypartForecast,
    nextWeek: { revenue: round(sum(forecast, (f) => f.forecast)), band },
    trainWindow: d.period.label,
  };
}

export function computePrescriptive(data, descriptive, input = {}) {
  const d = descriptive || computeDescriptive(data);
  const days = d.period.days || 1;
  const attachTarget = clamp(Number(input.attachTargetPct) || 25, 0, 60);
  const foodpandaGrowth = clamp(Number(input.foodpandaGrowthPct) || 0, -20, 40);

  const attachLiftPct = attachTarget - d.kpis.addonAttachRate;
  const addonLinesPerDay = (d.kpis.lines / days) * (attachLiftPct / 100);
  const avgAddonPrice = d.addons.length ? sum(d.addons, (a) => a.revenue) / sum(d.addons, (a) => a.count) : 20;
  const addonUplift = addonLinesPerDay * avgAddonPrice * 30;

  const fp = d.byChannel.find((c) => c.channel === 'Foodpanda') || { revenue: 0 };
  const channelUplift = fp.revenue * (foodpandaGrowth / 100);

  const projectedMonthlyRevenue = round(d.kpis.salesPerDay * 30 + addonUplift + channelUplift);
  const cogsRatio = 0.36;
  const fixedCost = 28000;
  const profit = projectedMonthlyRevenue * (1 - cogsRatio) - fixedCost;

  const staffing = d.byDaypart.map((p) => {
    const ordersPerHour = p.orders / days / 4;
    return {
      daypart: p.daypart,
      ordersPerDay: round(p.orders / days, 1),
      staff: Math.max(1, Math.ceil(ordersPerHour / 6)),
      revenuePerDay: round(p.revenue / days),
    };
  });

  const top = d.topItems[0] || { name: '-', revenue: 0 };
  const topAddon = d.addons[0] || { name: 'Black Pearl', count: 0 };
  const slow = [...d.byDaypart].sort((a, b) => a.revenue - b.revenue)[0] || { daypart: '-' };
  const food = d.kpis.foodShare;

  const recommendations = [
    {
      tag: 'Bestsellers',
      title: `Feature ${top.name} in a combo`,
      detail: `${top.name} is the top revenue item at PHP ${round(top.revenue).toLocaleString()}. Pair it with a drink or dessert and put it first on the menu board and Foodpanda listing.`,
      impact: ` Protects the highest-demand item while raising ticket size.`,
    },
    {
      tag: 'Add-on upsell',
      title: `Lift add-on attach toward ${attachTarget}%`,
      detail: `Add-ons currently attach to ${d.kpis.addonAttachRate}% of sold lines; ${topAddon.name} leads. Prompt "add Black Pearl / creamcheese?" at the counter and on delivery notes.`,
      impact: `About PHP ${round(addonUplift).toLocaleString()} extra revenue per month at the target attach rate.`,
    },
    {
      tag: 'Foodpanda',
      title: `Grow delivery ${foodpandaGrowth >= 0 ? 'by' : 'by'} ${foodpandaGrowth}%`,
      detail: `Foodpanda contributes ${d.kpis.foodpandaShare}% of revenue. Use bundle deals, updated photos and promo codes on slow weekdays rather than discounting the whole menu.`,
      impact: `About PHP ${round(channelUplift).toLocaleString()} monthly revenue change at this growth rate.`,
    },
    {
      tag: 'Menu mix',
      title: food < 45 ? 'Push rice meals at lunch' : 'Protect the food-and-drink balance',
      detail: `Food is ${food}% of revenue and drinks ${d.kpis.drinkShare}%. Cross-promote a rice-meal + iced-tea lunch set to lift the food side without cannibalising drink sales.`,
      impact: 'Balances revenue across dayparts and reduces reliance on a single category.',
    },
    {
      tag: 'Staffing',
      title: `Staff ${slow.daypart} deliberately`,
      detail: `${slow.daypart} is the quietest daypart. Schedule fewer staff then and move them to the busiest period (${d.kpis.busiestDaypart}) instead of keeping flat coverage all day.`,
      impact: 'Aligns labour with real demand and improves service at peak.',
    },
  ];

  return {
    input: { attachTargetPct: attachTarget, foodpandaGrowthPct: foodpandaGrowth },
    addon: { currentAttachPct: d.kpis.addonAttachRate, targetAttachPct: attachTarget, estimatedMonthlyUplift: round(addonUplift) },
    channel: { currentFoodpandaRevenue: round(fp.revenue), growthPct: foodpandaGrowth, estimatedMonthlyChange: round(channelUplift) },
    staffing,
    scenario: {
      projectedMonthlyRevenue,
      cogs: round(projectedMonthlyRevenue * cogsRatio),
      fixedCost,
      estimatedProfit: round(profit),
      margin: round(pct(profit, projectedMonthlyRevenue), 1),
    },
    recommendations,
    assumptions: [
      'Transaction rows are generated sample data based on the real menu and prices.',
      `Variable cost is assumed at ${cogsRatio * 100}% of revenue and fixed monthly cost at PHP ${fixedCost.toLocaleString()}.`,
      'Add-on and channel uplifts are simple scenario estimates, not guarantees.',
    ],
  };
}

export default { computeDescriptive, computePredictive, computePrescriptive };
