import { request, qs } from './api.js';

// One row in sales_fact = one sold menu line. `order_id` groups it into a visit.
export const listSalesData = (params) => request(`/sales-data${qs(params)}`);
export const listSales = listSalesData;
export const listOrders = listSalesData;
export const listTransactions = listSalesData;

// Admin-only: persists a new sold line into Neon sales_fact.
export const createSale = (payload) =>
  request('/sales', { method: 'POST', body: JSON.stringify(payload) });

export default { listSalesData, listSales, listOrders, listTransactions, createSale };
