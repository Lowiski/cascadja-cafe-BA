import { request } from './api.js';

export const listCustomers = (params) => request(`/data/customers${params ? `?${params}` : ''}`);

export const addCustomer = (body) =>
  request('/customers', { method: 'POST', body: JSON.stringify(body) });

export default { listCustomers, addCustomer };
