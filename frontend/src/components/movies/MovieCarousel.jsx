import EmptyState from '../ui/EmptyState.jsx';
import MovieCard from './MovieCard.jsx';

export default function MovieCarousel({ sectionTitle, movies }) {
  if (!movies || !movies.length) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-2xl font-bold uppercase text-white">{sectionTitle}</h2>
          <EmptyState
            title="No hay películas para mostrar"
            message="La cartelera se completará automáticamente cuando la API entregue películas reales desde SQL Server."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Encabezado de la sección similar a tu ejemplo HTML */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
            {sectionTitle}
          </h2>
          <a href="#" className="hidden text-sm font-semibold text-gold hover:underline md:inline-block">
            Ver todo
          </a>
        </div>

        {/* Contenedor del slider horizontal con Tailwind */}
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {movies.map((movie) => (
            <div 
              key={movie.idPelicula || movie.IdPelicula || movie.titulo} 
              className="w-48 flex-none snap-start sm:w-56 md:w-64"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}