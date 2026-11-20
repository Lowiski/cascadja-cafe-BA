import { request, getToken, setToken, clearToken } from './api.js';

export { getToken, setToken, clearToken };

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function login(username, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(result.token);
  return result.user;
}

export async function me() {
  const result = await request('/auth/me');
  return result.user;
}

export function logout() {
  clearToken();
}

export default { login, logout, me, isAuthenticated, getToken, setToken, clearToken };
