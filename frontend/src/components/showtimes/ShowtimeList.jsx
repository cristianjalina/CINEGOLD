import EmptyState from '../ui/EmptyState.jsx';
import MovieShowtimeCard from './MovieShowtimeCard.jsx';

export default function ShowtimeList({
  movies = [],
  variant = 'cartelera'
}) {

  if (!movies.length) {
    return (
      <EmptyState
        title={
          variant === 'preventa'
            ? 'No hay preventas disponibles'
            : 'No hay funciones disponibles'
        }
        message="Cuando SQL Server entregue funciones reales, se mostrarán los horarios disponibles aquí."
      />
    );
  }

  return (
    <div className="mt-8 space-y-8">

      {movies.map((movie) => (

        <MovieShowtimeCard
          key={
            movie.idPelicula ||
            movie.IdPelicula ||
            movie.titulo
          }
          movie={movie}
          variant={variant}
        />

      ))}

    </div>
  );
}