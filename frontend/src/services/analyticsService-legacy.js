import { request } from './api.js';

export const getDescriptive = () => request('/descriptive');
export const getPredictive = () => request('/predictive');
export const getPrescriptive = (input = {}) =>
  request('/prescriptive', { method: 'POST', body: JSON.stringify(input) });
export const getMarketing = (params = {}) =>
  request(`/data/marketing${new URLSearchParams(params).toString() ? `?${new URLSearchParams(params)}` : ''}`);

export default { getDescriptive, getPredictive, getPrescriptive, getMarketing };
