// Shared numeric/date helpers used by the analytics services.
// The original analytics.js keeps its own copies so its behaviour is unchanged.
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const ELASTICITY = -1.1;

export const round = (n, d = 0) => {
  const f = 10 ** d;
  return Math.round((Number(n) || 0) * f) / f;
};
export const sum = (arr, fn) => arr.reduce((s, x) => s + (fn ? fn(x) : x), 0);
export const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function monthKey(dateStr) {
  return String(dateStr).slice(0, 7);
}
export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`;
}
export function daysInMonthKey(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function nextMonthKey(key, offset) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + offset, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

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
