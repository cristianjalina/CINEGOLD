import { apiClient } from './apiClient.js';

export async function login(credentials) {
  return apiClient.rootPost('/login', credentials);
}

export async function registerClient(payload) {
  return apiClient.rootPost('/registro', payload);
}

export async function activateCinegoldPlus(payload) {
  return apiClient.post('/cinegold-plus/activar', payload);
}
