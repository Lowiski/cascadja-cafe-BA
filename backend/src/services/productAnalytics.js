import { computeDescriptive } from '../analytics.js';

// Menu / room performance views used by product charts and recommendations.
export function computeProductAnalytics(data, descriptive) {
  const d = descriptive || computeDescriptive(data);
  return {
    byCategory: d.byCategory,
    topProducts: d.topProducts,
    roomMix: d.roomMix,
    topProduct: d.kpis.topProduct,
    roomShare: d.kpis.roomShare,
  };
}

export default computeProductAnalytics;
