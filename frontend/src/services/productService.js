import { request, qs } from './api.js';

// The menu is the active product master (real items and prices).
export const listMenu = (params) => request(`/data/menu${qs(params)}`);
export const listProducts = listMenu;

// Admin-only: persists a new item into Neon menu_items.
export const createMenuItem = (payload) =>
  request('/menu', { method: 'POST', body: JSON.stringify(payload) });

export default { listMenu, listProducts, createMenuItem };
