import { request } from './api.js';

// Active analytics endpoints for Cascadja Foods and Drinks.
export const getDescriptive = () => request('/descriptive');
export const getPredictive = () => request('/predictive');
export const getPrescriptive = (input = {}) =>
  request('/prescriptive', { method: 'POST', body: JSON.stringify(input) });
export const getMenu = () => request('/menu');

export default { getDescriptive, getPredictive, getPrescriptive, getMenu };
