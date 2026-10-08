import { apiClient } from './apiClient.js';

export async function fetchMovies() {
  const payload = await apiClient.get('/peliculas');
  return payload?.data || [];
}

export async function fetchFeaturedMovies() {
  const payload = await apiClient.get('/peliculas/destacadas');
  return payload?.data || [];
}

export async function fetchCarteleraOverview() {
  const payload = await apiClient.get('/peliculas/cartelera');
  return payload?.data || { peliculas: [], fechasDisponibles: [], funciones: [] };
}

export async function fetchUpcomingMovies() {
  const payload = await apiClient.get('/peliculas/preventa');
  return payload?.data || [];
}

export async function fetchMovieById(idPelicula) {
  if (!idPelicula) return null;
  const payload = await apiClient.get(`/peliculas/${idPelicula}`);
  return payload?.data || null;
}

export async function fetchShowtimes() {
  const payload = await apiClient.get('/funciones');
  return payload?.data || [];
}

export async function fetchShowtimesByMovie(idPelicula) {
  if (!idPelicula) return [];
  const payload = await apiClient.get(`/peliculas/${idPelicula}/funciones`);
  return payload?.data || [];
}

export async function fetchPromotions() {
  const payload = await apiClient.get('/promociones');
  return payload?.data || [];
}

export async function fetchMemberships() {
  const payload = await apiClient.get('/membresias');
  return payload?.data || [];
}

export async function fetchGenres() {
  const payload = await apiClient.get('/generos');
  return payload?.data || [];
}

export async function fetchCombos() {
  const payload = await apiClient.get('/combos');
  return payload?.data || [];
}

export async function fetchInformationSections() {
  const payload = await apiClient.get('/informacion');
  return payload?.data || [];
}

export async function fetchSeatsByFunction(idFuncion) {
  if (!idFuncion) return [];
  const payload = await apiClient.get(`/funciones/${idFuncion}/asientos`);
  return payload?.data || [];
}
