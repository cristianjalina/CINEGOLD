export function groupShowtimesByMovie(showtimes) {
  const movies = new Map();

  for (const item of showtimes) {
    const id = item.IdPelicula || item.idPelicula;
    if (!movies.has(id)) {
      movies.set(id, {
        idPelicula: id,
        titulo: item.Pelicula || item.titulo,
        duracionMinutos: item.DuracionMinutos || item.duracionMinutos,
        genero: item.Genero || item.genero,
        formato: item.Formato || item.formato,
        tipoSala: item.TipoSala || item.tipoSala,
        cine: item.Cine || item.cine,
        funciones: [],
      });
    }

    movies.get(id).funciones.push(item);
  }

  return Array.from(movies.values());
}

export function uniqueShowtimeDates(showtimes) {
  const dates = new Map();
  for (const item of showtimes) {
    const value = item.Fecha || item.fecha;
    if (value && !dates.has(value)) dates.set(value, value);
  }
  return Array.from(dates.values());
}
