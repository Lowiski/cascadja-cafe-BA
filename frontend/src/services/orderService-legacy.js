import { request, qs } from './api.js';

// Sales line items are the order detail; transactions are the order headers.
export const listSales = (params) => request(`/data/sales${qs(params)}`);
export const listTransactions = (params) => request(`/data/transactions${qs(params)}`);
export const listOrders = listTransactions;

export default { listSales, listTransactions, listOrders };
