import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6d5a4c';
Chart.defaults.borderColor = 'rgba(59, 42, 32, 0.09)';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(43, 30, 23, 0.94)';
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleFont = { family: "'Inter', sans-serif", weight: '600' };
Chart.defaults.plugins.tooltip.bodyFont = { family: "'Inter', sans-serif" };
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.padding = 16;

export const PALETTE = ['#c08552', '#6f7f63', '#a44a3f', '#d9a441', '#7d6b8f', '#4f7c82', '#b06a47', '#8e9c7a'];
export const PALETTE_SOFT = ['rgba(192,133,82,.82)', 'rgba(111,127,99,.82)', 'rgba(164,74,63,.82)', 'rgba(217,164,65,.82)', 'rgba(125,107,143,.82)', 'rgba(79,124,130,.82)', 'rgba(176,106,71,.82)', 'rgba(142,156,122,.82)'];

export const moneyTick = (value) => {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₱${Math.round(n / 1_000)}k`;
  return `₱${n}`;
};

export const moneyTooltip = {
  callbacks: {
    label: (ctx) => `${ctx.dataset.label || ctx.label}: ${new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(Number(ctx.parsed.y ?? ctx.parsed ?? 0))}`,
  },
};

export function baseOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
      },
      tooltip: { padding: 12 },
    },
    ...extra,
  };
}

export function comboOptions() {
  return baseOptions({
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(59,42,32,.07)' },
        ticks: { callback: moneyTick },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { display: false },
        ticks: { callback: moneyTick, color: '#6f7f63' },
      },
    },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
      tooltip: moneyTooltip,
    },
  });
}

export function doughnutOptions(extra = {}) {
  return baseOptions({
    cutout: '64%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14 } },
      tooltip: moneyTooltip,
    },
    ...extra,
  });
}

export function horizontalOptions(extra = {}) {
  return baseOptions({
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(59,42,32,.07)' }, ticks: { callback: moneyTick } },
      y: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: moneyTooltip,
    },
    ...extra,
  });
}
