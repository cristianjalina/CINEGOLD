export const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
export const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600';

export function movieId(movie) {
  return movie?.idPelicula ?? movie?.id ?? movie?.IdPelicula;
}

export function movieTitle(movie) {
  return movie?.titulo ?? movie?.title ?? movie?.Pelicula ?? movie?.Titulo ?? 'Pelicula';
}

export function moviePoster(movie) {
  return movie?.imagenPoster || movie?.ImagenPoster || movie?.poster || movie?.img || FALLBACK_POSTER;
}

export function movieBackdrop(movie) {
  return movie?.imagenBackdrop || movie?.ImagenBackdrop || movie?.backdrop || moviePoster(movie) || FALLBACK_BACKDROP;
}

export function movieTrailerYoutubeId(movie) {
  const value = movie?.trailerYoutubeId || movie?.TrailerYoutubeId || movie?.TrailerYouTubeId || movie?.trailer || '';
  const text = String(value || '').trim();
  if (!text) return '';
  const watchMatch = text.match(/[?&]v=([^&]+)/i);
  const shortMatch = text.match(/youtu\.be\/([^?&/]+)/i);
  const embedMatch = text.match(/youtube\.com\/embed\/([^?&/]+)/i);
  const id = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || text;
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
}

export function movieType(movie) {
  if (movie?.esPreventa || movie?.proximamente) return 'Preventa';
  return movie?.estadoCartelera || movie?.generos?.split(',')?.[0] || movie?.genero || 'Estreno';
}

export function isUpcoming(movie) {
  return Boolean(movie?.proximamente || movie?.esPreventa);
}

export function showtimeDateKey(showtime) {
  if (!showtime?.fecha) return '';
  return String(showtime.fecha).slice(0, 10);
}
