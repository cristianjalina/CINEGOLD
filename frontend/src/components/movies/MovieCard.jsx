import { formatMinutes } from '../../utils/formatters.js';

export default function MovieCard({ movie }) {
  const title = movie.titulo || movie.Pelicula || movie.PeliculaTitulo;
  const genre = movie.genero || movie.Genero || 'Género no disponible';
  const duration = movie.duracionMinutos || movie.DuracionMinutos;

  return (
    <article className="group cursor-pointer overflow-hidden rounded-none bg-surface hover:-translate-y-2 hover:shadow-2xl hover:shadow-black transition-transform duration-300">
      <div className="flex aspect-[2/3] items-center justify-center bg-line p-6 group-hover:bg-zinc-900">
        <p className="break-words text-center text-lg font-bold uppercase leading-tight text-gold">
          {title}
        </p>
      </div>
      <div className="p-5">
        <h3 className="truncate text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-cinemaMuted">
          {genre} <span className="opacity-50">•</span> {formatMinutes(duration)}
        </p>
      </div>
    </article>
  );
}