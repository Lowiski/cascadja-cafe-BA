// Compatibility `api` object assembled from the active services.
// Legacy consumers remain importable as *-legacy.js files.
import { meta, health, table } from './services/api.js';
import { getDescriptive, getPredictive, getPrescriptive } from './services/analyticsService.js';
import { listMenu } from './services/productService.js';
import { listSalesData } from './services/orderService.js';

export const api = {
  meta,
  health,
  table,
  descriptive: getDescriptive,
  predictive: getPredictive,
  prescriptive: getPrescriptive,
  menu: listMenu,
  salesData: listSalesData,
  listMenu,
  listSalesData,
  listProducts: listMenu,
  listSales: listSalesData,
};

export default api;
