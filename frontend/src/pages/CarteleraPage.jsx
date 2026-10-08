import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCarteleraOverview, fetchGenres } from '../services/catalogService.js';
import { movieId, moviePoster, movieTitle } from '../utils/catalogMappers.js';

const IconFilter = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M10 18h4v-4h-4v4zM3 6v4h18V6H3zm3 7h12v-4H6v4z" />
  </svg>
);

const IconTicket = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2 7.03V18H4v-1.03c1.64-.81 2.75-2.5 2.75-4.47S5.64 8.84 4 8.03V6h16v1.03c-1.64.81-2.75 2.5-2.75 4.47s1.11 3.66 2.75 4.47zM11 9h2v2h-2zm0 4h2v2h-2z" />
  </svg>
);

const SolidTab = ({ leftContent, rightContent, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center h-12 transition-all duration-200 rounded-none outline-none ${
      isActive
        ? 'bg-[#C5A03A] text-black shadow-[4px_4px_0_white] translate-y-0'
        : 'bg-[#111] text-white hover:bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-[4px_4px_0_white]'
    }`}
  >
    {leftContent && (
      <div className={`w-12 flex items-center justify-center shrink-0 h-full ${isActive ? 'bg-black/20' : 'bg-black/40'}`}>
        <span className="font-black text-sm uppercase">{leftContent}</span>
      </div>
    )}
    <div className="px-5 h-full flex items-center font-black text-xs md:text-sm uppercase tracking-widest whitespace-nowrap">
      {rightContent}
    </div>
  </button>
);

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function CarteleraPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('Todas');
  const [selectedDate, setSelectedDate] = useState('');
  const [peliculas, setPeliculas] = useState([]);
  const [fechas, setFechas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchCarteleraOverview();
      const genreList = await fetchGenres();
      setPeliculas(data.peliculas || []);
      setFechas(data.fechasDisponibles || []);
      setGeneros(genreList || []);
      setSelectedDate((data.fechasDisponibles || [])[0]?.date || '');
      setLoading(false);
    }

    load();
  }, []);

  const filtros = useMemo(() => ['Todas', 'Estreno', 'Preventa', ...generos], [generos]);

  const filteredMovies = peliculas.filter((movie) => {
    if (filtro === 'Todas') return true;
    const text = normalize(`${movie.generos || ''} ${movie.estadoCartelera || ''} ${movie.titulo || ''}`);
    return text.includes(normalize(filtro));
  });

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">CARGANDO CINEGOLD...</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans selection:bg-[#C5A03A] selection:text-black pb-32">
      <div className="relative z-10 pt-24 pb-10 px-6 md:px-12 max-w-[1920px] mx-auto">
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none m-0 text-white">Cartelera</h1>
            <div className="mt-4 inline-block bg-white text-black px-5 py-3 font-black text-xs md:text-sm uppercase tracking-widest shadow-[4px_4px_0_#C5A03A]">
              Programacion Oficial
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-4 mt-6">
            {filtros.map((t) => (
              <SolidTab
                key={t}
                leftContent={t === 'Todas' ? <IconFilter /> : null}
                rightContent={t}
                isActive={filtro === t}
                onClick={() => setFiltro(t)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-12">
        <div className="mb-14 pt-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-16 pt-3">
            {fechas.map((f) => (
              <div key={f.fecha || f.date} className="relative shrink-0">
                <SolidTab
                  leftContent={(f.day || '').toUpperCase()}
                  rightContent={f.date}
                  isActive={selectedDate === f.date}
                  onClick={() => setSelectedDate(f.date)}
                />
                <AnimatePresence>
                  {selectedDate === f.date && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-3 -right-3 bg-white text-black font-black text-[10px] uppercase px-3 py-1 shadow-[3px_3px_0_#C5A03A] rounded-none z-20"
                    >
                      HOY
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredMovies.map((movie) => (
              <motion.div
                layout
                key={movieId(movie)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col bg-[#111] rounded-none hover:-translate-y-2 hover:shadow-[10px_10px_0_#C5A03A] transition-all duration-300"
              >
                <div className="absolute top-4 left-4 z-20 bg-white text-black font-black text-xs tracking-widest uppercase px-4 py-2 shadow-[4px_4px_0_#C5A03A] rounded-none">
                  {movie.estadoCartelera || 'En Cartelera'}
                </div>

                <div className="relative overflow-hidden w-full aspect-[3/4] bg-[#050505] shrink-0">
                  <img
                    src={moviePoster(movie)}
                    alt={movieTitle(movie)}
                    className="w-full h-full object-cover grayscale-[40%] contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1 justify-between bg-[#111] gap-8">
                  <div>
                    <h3 className="font-black text-3xl md:text-4xl uppercase tracking-tighter text-white leading-tight">
                      {movieTitle(movie)}
                    </h3>
                    <p className="text-[#888] font-bold text-xs uppercase mt-3 tracking-[0.2em]">
                      Disponibilidad <span className="text-[#C5A03A]">Confirmada</span>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/funciones/${movieId(movie)}`)}
                    className="relative w-full bg-[#050505] text-white flex justify-between items-center px-6 py-5 transition-all duration-300 rounded-none outline-none hover:bg-[#C5A03A] hover:text-black hover:shadow-[6px_6px_0_white]"
                  >
                    <span className="font-black text-sm uppercase tracking-widest">Ver Funciones</span>
                    <div className="text-white group-hover:text-black transition-colors duration-300">
                      <IconTicket />
                    </div>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
