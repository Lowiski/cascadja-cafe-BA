import { request, qs } from './api.js';

export const listProducts = (params) => request(`/data/products${qs(params)}`);

export default { listProducts };
