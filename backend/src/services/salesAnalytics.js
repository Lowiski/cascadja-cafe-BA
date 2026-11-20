import { computeDescriptive } from '../analytics.js';

// Revenue, monthly trend, channel mix and room unit economics.
export function computeSalesAnalytics(data, descriptive) {
  const d = descriptive || computeDescriptive(data);
  return {
    period: d.period,
    kpis: d.kpis,
    monthly: d.monthly,
    byChannel: d.byChannel,
    unitEconomics: d.unitEconomics,
  };
}

export default computeSalesAnalytics;
