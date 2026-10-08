import { apiClient } from './apiClient.js';

export async function sendContactMessage(payload) {
  return apiClient.post('/contacto', payload);
}
