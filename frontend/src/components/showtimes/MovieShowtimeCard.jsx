import { useNavigate } from 'react-router-dom';
import { formatMinutes, formatTime } from '../../utils/formatters.js';
import Badge from '../ui/Badge.jsx';

export default function MovieShowtimeCard({ movie, variant = 'cartelera' }) {
  const navigate = useNavigate();

  const title =
    movie.titulo ||
    movie.Pelicula ||
    movie.PeliculaTitulo;

  const cardClass =
    variant === 'preventa'
      ? 'rounded-3xl bg-surface p-8'
      : 'py-8';

  const posterClass =
    variant === 'preventa'
      ? 'bg-field'
      : 'bg-line';

  return (
    <article className={`flex flex-col gap-6 md:flex-row md:gap-8 ${cardClass}`}>

      <div className={`flex aspect-[2/3] w-full max-w-[12rem] shrink-0 items-center justify-center rounded-xl ${posterClass}`}>
        <p className="p-4 text-center text-sm font-bold uppercase text-gold">
          {title}
        </p>
      </div>

      <div className="flex-1">

        <h3 className="text-2xl font-bold text-white md:text-3xl">
          {title}
        </h3>

        <div className="mt-2">
          <Badge>
            {
              variant === 'preventa'
                ? 'PREVENTA'
                : movie.tipoSala
                ? `SALA ${movie.tipoSala}`
                : 'SALA'
            }
          </Badge>
        </div>

        <p className="mt-4 text-base text-slate-100">
          {movie.genero || 'Género no disponible'} | {formatMinutes(movie.duracionMinutos)}
        </p>

        <div className="my-6 border-t border-line"></div>

        <div className="flex flex-wrap gap-4">

          {(movie.funciones || []).map((funcion) => (

            <button
              key={`${funcion.IdFuncion || funcion.idFuncion || funcion.Hora}-${funcion.Sala}`}
              onClick={() =>
                navigate('/reservas', {
                  state: { movie, funcion }
                })
              }
              className="rounded-lg border border-line px-6 py-2.5 text-sm font-medium text-white hover:border-gold hover:bg-gold/10 hover:text-gold"
            >
              {formatTime(funcion.Hora || funcion.hora)}
            </button>

          ))}

        </div>

      </div>

    </article>
  );
}