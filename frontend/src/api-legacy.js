//Compatibility barrel: the original `api` object is assembled from the
//new service modules so every existing page keeps working unchanged.
import { meta, health, table } from './services/api.js';
import { addCustomer, listCustomers } from './services/customerService.js';
import { listProducts } from './services/productService.js';
import { listSales, listTransactions } from './services/orderService.js';
import { getDescriptive, getPredictive, getPrescriptive } from './services/analyticsService.js';

export const api = {
  meta,
  health,
  descriptive: getDescriptive,
  predictive: getPredictive,
  prescriptive: getPrescriptive,
  table,
  addCustomer,
  listCustomers,
  listProducts,
  listSales,
  listTransactions,
};

export default api;
