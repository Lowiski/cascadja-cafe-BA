
// Shared HTTP layer for every frontend service.

const API_URL = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/+$/, '');

const BASE = `${API_URL}/api`;

const TOKEN_KEY = 'cascadja_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options;
  const token = getToken();

  const separator = path.includes('?') ? '&' : '?';

  const url = `${BASE}${path}${separator}_ts=${Date.now()}`;

  const res = await fetch(url, {
    ...rest,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(optionHeaders || {}),
    },
  });

  if (res.status === 401 && path !== '/auth/login') {
    clearToken();

    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return res.json();
}

export const qs = (params) => {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      search.set(k, String(v));
    }
  });

  const out = search.toString();

  return out ? `?${out}` : '';
};

export const meta = () => request('/meta');
export const health = () => request('/health');
export const table = (name, params) =>
  request(`/data/${name}${qs(params)}`);

export default request;
