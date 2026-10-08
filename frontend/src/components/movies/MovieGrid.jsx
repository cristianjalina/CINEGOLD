import EmptyState from '../ui/EmptyState.jsx';
import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies }) {
  if (!movies.length) {
    return (
      <EmptyState
        title="No hay películas para mostrar"
        message="La cartelera se completará automáticamente cuando la API entregue películas reales desde SQL Server."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.idPelicula || movie.IdPelicula || movie.titulo} movie={movie} />
      ))}
    </div>
  );
}
