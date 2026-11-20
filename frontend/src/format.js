export const peso = (value, digits = 0) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(value) || 0);

export const number = (value, digits = 0) =>
  new Intl.NumberFormat('en-PH', { maximumFractionDigits: digits }).format(Number(value) || 0);

export const compactPeso = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `₱${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `₱${(n / 1_000).toFixed(1)}k`;
  return peso(n);
};

export const percent = (value, digits = 1) => `${(Number(value) || 0).toFixed(digits)}%`;

export const signedPercent = (value, digits = 1) => {
  const n = Number(value) || 0;
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
};

export const signedPeso = (value) => {
  const n = Number(value) || 0;
  return `${n >= 0 ? '+' : '−'}${peso(Math.abs(n))}`;
};

export const titleCase = (value) =>
  String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase());
