const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';
const API_BASE = `${API_ORIGIN}/api`;

async function request(url, options = {}) {
  const token = window.localStorage.getItem('cinegold_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.message || 'No se pudo completar la solicitud.');
    error.status = response.status;
    error.details = payload?.details || payload?.issues || null;
    if (response.status === 401) {
      window.localStorage.removeItem('cinegold_token');
      window.localStorage.removeItem('cinegold_user');
      window.dispatchEvent(new CustomEvent('cinegold:auth-expired'));
    }
    throw error;
  }

  return payload;
}

export const apiClient = {
  get: (path) => request(`${API_BASE}${path}`),
  post: (path, body) =>
    request(`${API_BASE}${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (path, body) =>
    request(`${API_BASE}${path}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (path) =>
    request(`${API_BASE}${path}`, {
      method: 'DELETE',
    }),
  rootPost: (path, body) =>
    request(`${API_ORIGIN}${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
