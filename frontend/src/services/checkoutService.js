import { apiClient } from './apiClient.js';

export async function processTicketPurchase(payload) {
  return apiClient.post('/comprar', payload);
}
