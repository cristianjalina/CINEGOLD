import { apiClient } from './apiClient.js';

export async function fetchMonthlySales() {
  const payload = await apiClient.get('/admin/dashboard/ventas-mensuales');
  return payload?.data || [];
}
