import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { fetchFeaturedMovies, fetchMovies, fetchUpcomingMovies, fetchPromotions } from '../services/catalogService.js';
import { movieBackdrop, movieId, moviePoster, movieTitle, movieTrailerYoutubeId } from '../utils/catalogMappers.js';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-coverflow';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [todasLasPeliculas, setTodasLasPeliculas] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [proximamente, setProximamente] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [activeTrailer, setActiveTrailer] = useState(null);

  const showIntro = useMemo(() => {
    const introPlayed = sessionStorage.getItem('cinegold_intro_played');
    if (!introPlayed) {
      sessionStorage.setItem('cinegold_intro_played', 'true');
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    async function load() {
      const [featured, movies, upcoming, promoList] = await Promise.all([
        fetchFeaturedMovies(),
        fetchMovies(),
        fetchUpcomingMovies(),
        fetchPromotions(),
      ]);
      setHeroMovies(featured);
      setTodasLasPeliculas(movies);
      setProximamente(upcoming);
      setPromotions(promoList || []);
    }

    load();
  }, []);

  useEffect(() => {
    const reload = () => {
      fetchFeaturedMovies().then(setHeroMovies);
      fetchMovies().then(setTodasLasPeliculas);
      fetchUpcomingMovies().then(setProximamente);
      fetchPromotions().then((promoList) => setPromotions(promoList || []));
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload();
    };
    window.addEventListener('cinegold:data-changed', reload);
    window.addEventListener('focus', reload);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('cinegold:data-changed', reload);
      window.removeEventListener('focus', reload);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const menuAccesosRapidos = [
    { id: 'schedule', title: 'Calendario', path: '/cartelera', icon: <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14V7H5v14z" /> },
    { id: 'price', title: 'Precios', path: '/informacion', icon: <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: 'concession', title: 'Dulcería', path: '/DulceriaPage', icon: <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454-1.05 0-1.92-.6-2.45-1.5-.53.9-1.4 1.5-2.45 1.5-1.05 0-1.92-.6-2.45-1.5-.53.9-1.4 1.5-2.45 1.5s-1.92-.6-2.45-1.5c-.53.9-1.4 1.5-2.45 1.5-.454 0-.977-.151-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7H3v7h18zm-3-9v-2H6v2h12z" /> },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const filteredMovies = todasLasPeliculas.filter((movie) =>
    movieTitle(movie).toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const visibleMovies = filteredMovies.slice(0, 20);
  const heroMoviesWithTrailer = heroMovies.filter((movie) => movieTrailerYoutubeId(movie));
  const allMoviesWithTrailer = todasLasPeliculas.filter((movie) => movieTrailerYoutubeId(movie));
  const visibleHeroMovies = heroMoviesWithTrailer.length ? heroMoviesWithTrailer : allMoviesWithTrailer.slice(0, 3);
  const closeTrailer = () => setActiveTrailer(null);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#D4AF37] selection:text-black pb-20">
      {activeTrailer ? (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 px-4 py-8 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Trailer ${activeTrailer.title}`}
          onClick={closeTrailer}
        >
          <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">
                {activeTrailer.title}
              </h2>
              <button
                type="button"
                onClick={closeTrailer}
                className="cursor-pointer bg-[#D4AF37] text-black font-black uppercase tracking-widest px-5 py-3 hover:bg-white transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black shadow-[12px_12px_0_#D4AF37]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeTrailer.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={`Trailer ${activeTrailer.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}

      {showIntro && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
          className="fixed inset-0 z-[9999] bg-[#D4AF37] flex items-center justify-center pointer-events-none"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-7xl md:text-9xl font-black text-black uppercase tracking-tighter"
          >
            CINEGOLD
          </motion.h1>
        </motion.div>
      )}

      <div className="relative w-full h-[45vh] md:h-[55vh] bg-black overflow-hidden">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {visibleHeroMovies.map((movie) => {
            const trailerYoutubeId = movieTrailerYoutubeId(movie);
            return (
            <SwiperSlide key={movieId(movie)} className="relative w-full h-full">
              <div className="absolute inset-0 z-0 opacity-60 pointer-events-none flex items-center justify-center bg-black">
                <iframe
                  className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-full min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  src={`https://www.youtube.com/embed/${trailerYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${trailerYoutubeId}&controls=0&rel=0&showinfo=0&disablekb=1&modestbranding=1&playsinline=1&iv_load_policy=3`}
                  title={`Trailer de fondo ${movieTitle(movie)}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none" />

              <div className="relative z-[80] h-full max-w-[1920px] mx-auto px-6 md:px-16 flex flex-col justify-center pointer-events-auto">
                <div className="max-w-3xl">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="inline-block bg-white text-black px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                  >
                    Estreno Exclusivo
                  </motion.span>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6"
                  >
                    {movieTitle(movie)}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="flex flex-wrap gap-4"
                  >
                    <a
                      href={`/funciones/${movieId(movie)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/funciones/${movieId(movie)}`);
                      }}
                      className="inline-flex items-center justify-center cursor-pointer bg-[#D4AF37] text-black font-black px-8 py-3 text-sm md:text-base uppercase tracking-widest hover:bg-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                      Comprar Boletos
                    </a>
                    <a
                      href={trailerYoutubeId ? `https://www.youtube.com/watch?v=${trailerYoutubeId}` : `/funciones/${movieId(movie)}`}
                      target={trailerYoutubeId ? '_blank' : undefined}
                      rel={trailerYoutubeId ? 'noopener noreferrer' : undefined}
                      onClick={(event) => {
                        if (trailerYoutubeId) {
                          event.preventDefault();
                          setActiveTrailer({ youtubeId: trailerYoutubeId, title: movieTitle(movie) });
                        } else {
                          event.preventDefault();
                          navigate(`/funciones/${movieId(movie)}`);
                        }
                      }}
                      className="inline-flex items-center justify-center cursor-pointer bg-transparent border border-white text-white font-bold px-6 py-3 text-sm md:text-base uppercase tracking-widest hover:bg-white hover:text-black hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                      {trailerYoutubeId ? 'Ver Trailer' : 'Ver Funciones'}
                    </a>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-16 mt-16 relative z-30">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 md:h-[400px]"
        >
          <motion.div variants={fadeUp} className="md:col-span-2 bg-white text-black flex flex-col justify-center p-8 group">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Búsqueda rápida</h3>
            <div className="flex items-center w-full border-b-2 border-black pb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ENCUENTRA TU PELÍCULA..."
                className="w-full bg-transparent text-black placeholder-black/30 font-black uppercase text-xl md:text-3xl outline-none"
              />
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm ? (
              <div className="mt-4 max-h-36 overflow-auto space-y-2">
                {filteredMovies.slice(0, 5).map((movie) => (
                  <button
                    key={movieId(movie)}
                    onClick={() => navigate(`/funciones/${movieId(movie)}`)}
                    className="block w-full text-left bg-black text-white px-4 py-3 uppercase text-sm font-black tracking-widest hover:bg-[#D4AF37] hover:text-black"
                  >
                    {movieTitle(movie)}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>

          <motion.div variants={fadeUp} onClick={() => navigate('/DulceriaPage')} className="bg-[#D4AF37] text-black p-8 flex flex-col justify-between cursor-pointer hover:bg-[#e3be47] transition-colors">
            <h3 className="text-3xl font-black uppercase leading-none tracking-tighter">Dulcería <br />2x1 Hoy</h3>
            <p className="text-sm font-bold uppercase tracking-widest mt-6">Ver Menú +</p>
          </motion.div>

          <motion.div variants={fadeUp} onClick={() => navigate('/preventa')} className="bg-[#111] p-8 flex flex-col justify-between md:row-span-2 group overflow-hidden relative cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="relative z-10 flex flex-col h-full justify-end">
              <h3 className="text-4xl font-black uppercase tracking-tighter text-white">Salas<br />Premium</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mt-4">Conoce la experiencia +</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} onClick={() => navigate('/informacion')} className="md:col-span-3 bg-[#1A1A1A] flex items-center justify-between p-8 hover:bg-[#222] transition-colors cursor-pointer">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Próximamente</h3>
              <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter text-white">
                {proximamente[0] ? movieTitle(proximamente[0]) : 'Preventa Exclusiva'}
              </h2>
            </div>
            <div className="w-12 h-12 bg-white text-black flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>

      

      <div id="seccion-todas-peliculas" className="max-w-[1920px] mx-auto px-6 md:px-16 mt-24 relative z-20">
        <div className="flex justify-between items-end mb-10 border-b border-[#333] pb-6">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            En Cartelera
          </h2>
          <button onClick={() => navigate('/cartelera')} className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            Ver Todo +
          </button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6"
        >
          {visibleMovies.map((movie) => (
            <motion.div
              variants={fadeUp}
              key={`todas-${movieId(movie)}`}
              className="group cursor-pointer relative bg-black overflow-hidden"
              onClick={() => navigate(`/funciones/${movieId(movie)}`)}
            >
              <div className="relative aspect-[2/3] w-full">
                <img
                  src={moviePoster(movie)}
                  alt={movieTitle(movie)}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 w-full p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-black uppercase text-lg leading-none mb-3 line-clamp-2">
                    {movieTitle(movie)}
                  </h3>
                  <div className="bg-[#D4AF37] text-black text-xs font-bold py-2 px-4 uppercase text-center tracking-widest">
                    Detalles
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {filteredMovies.length > visibleMovies.length ? (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate('/cartelera')}
              className="bg-[#D4AF37] text-black font-black uppercase tracking-widest px-8 py-4 shadow-[6px_6px_0_white] hover:bg-white transition-colors"
            >
              Ver más películas
            </button>
          </div>
        ) : null}
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-16 mt-24 relative z-20">
        <div className="flex justify-between items-end mb-10 border-b border-[#333] pb-6">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Promociones
          </h2>
          <button onClick={() => navigate('/promociones')} className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            Ver Todo +
          </button>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={24}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {promotions.map((promo) => (
            <SwiperSlide key={promo.idPromocion}>
              <button
                onClick={() => navigate('/promociones')}
                className="w-full text-left bg-[#111] hover:-translate-y-1 transition-transform duration-300 shadow-[8px_8px_0_#C5A03A]"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black">
                  <img
                    src={promo.imagenUrl || 'https://via.placeholder.com/1200x675?text=Promocion'}
                    alt={promo.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <div className="text-[#C5A03A] text-xs font-black uppercase tracking-[0.2em] mb-2">
                    {String(promo.categoria || 'Taquilla').toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight text-white">
                    {promo.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm font-bold mt-3 line-clamp-2">
                    {promo.descripcion}
                  </p>
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div id="marquee-section" className="w-full overflow-hidden relative z-10 py-24 opacity-20 pointer-events-none select-none mix-blend-screen transform -rotate-2">
        <motion.div
          className="flex text-[6rem] md:text-[10rem] font-black uppercase text-[#D4AF37] whitespace-nowrap leading-none tracking-tighter w-max"
          animate={{ x: ['0%', '-20%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 25 }}
        >
          <span className="pr-8">CINE SIN LÍMITES • EXPERIENCIA ÉPICA • VIVE LA MAGIA • </span>
          <span className="pr-8">CINE SIN LÍMITES • EXPERIENCIA ÉPICA • VIVE LA MAGIA • </span>
          <span className="pr-8">CINE SIN LÍMITES • EXPERIENCIA ÉPICA • VIVE LA MAGIA • </span>
          <span className="pr-8">CINE SIN LÍMITES • EXPERIENCIA ÉPICA • VIVE LA MAGIA • </span>
        </motion.div>
      </div>

      <div className="w-full bg-[#0a0a0a] mt-24 py-16 border-t border-[#111]">
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-wrap justify-center gap-12 md:gap-32 max-w-[1920px] mx-auto px-6"
        >
          {menuAccesosRapidos.map((item) => (
            <motion.li variants={fadeUp} key={item.id}>
              <button onClick={() => navigate(item.path)} className="flex flex-col items-center gap-4 group outline-none">
                <div className="w-20 h-20 bg-[#111] flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors duration-300">
                  {item.title}
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
