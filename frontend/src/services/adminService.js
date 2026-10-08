import { apiClient } from './apiClient.js';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';

async function authFetch(path, options = {}) {
  const token = window.localStorage.getItem('cinegold_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_ORIGIN}/api${path}`, {
    ...options,
    headers,
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new Error(payload?.message || 'No se pudo completar la solicitud.');
  }
  return payload;
}

export const adminService = {
  fetchMovies: () => apiClient.get('/admin/peliculas'),
  createMovie: (body) => apiClient.post('/admin/peliculas', body),
  updateMovie: (id, body) => apiClient.put(`/admin/peliculas/${id}`, body),
  deleteMovie: (id) => authFetch(`/admin/peliculas/${id}`, { method: 'DELETE' }),

  fetchProducts: () => apiClient.get('/admin/productos'),
  createProduct: (body) => apiClient.post('/admin/productos', body),
  updateProduct: (id, body) => authFetch(`/admin/productos/${id}`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  deleteProduct: (id) => authFetch(`/admin/productos/${id}`, { method: 'DELETE' }),

  fetchCombos: () => apiClient.get('/admin/combos'),
  createCombo: (body) => apiClient.post('/admin/combos', body),
  updateCombo: (id, body) => authFetch(`/admin/combos/${id}`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  deleteCombo: (id) => authFetch(`/admin/combos/${id}`, { method: 'DELETE' }),

  fetchPromotions: () => apiClient.get('/admin/promociones'),
  createPromotion: (body) => apiClient.post('/admin/promociones', body),
  updatePromotion: (id, body) => authFetch(`/admin/promociones/${id}`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  deletePromotion: (id) => authFetch(`/admin/promociones/${id}`, { method: 'DELETE' }),

  fetchFunctions: () => apiClient.get('/admin/funciones'),
  createFunction: (body) => apiClient.post('/admin/funciones', body),
  updateFunction: (id, body) => authFetch(`/admin/funciones/${id}`, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  deleteFunction: (id) => authFetch(`/admin/funciones/${id}`, { method: 'DELETE' }),
  fetchRooms: () => apiClient.get('/admin/salas'),

  uploadImage: async (file) => {
    const token = window.localStorage.getItem('cinegold_token');
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_ORIGIN}/api/admin/uploads/imagenes`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.message || 'No se pudo subir la imagen.');
    return payload.data?.file || payload.file;
  },
};
