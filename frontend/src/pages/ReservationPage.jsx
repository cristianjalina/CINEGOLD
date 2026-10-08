import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMovieById, fetchShowtimesByMovie } from '../services/catalogService.js';
import { movieBackdrop, movieId, moviePoster, movieTitle } from '../utils/catalogMappers.js';
import { setOrderDraft } from '../utils/orderDraft.js';

const FlatButton = ({ icon, text, subtext, isActive, onClick, disabled }) => {
  const btnBg = isActive ? 'bg-[#C5A03A]' : 'bg-[#151515] hover:bg-[#222222]';
  const textColor = isActive ? 'text-black' : 'text-white';
  const subtextColor = isActive ? 'text-black/75' : 'text-gray-400';
  const iconColor = isActive ? 'text-black' : 'text-[#C5A03A]';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`flex w-full h-14 transition-all duration-300 ease-out ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'} ${isActive ? 'hover:bg-[#C5A03A]' : ''} shrink-0 ${btnBg}`}
    >
      <div className={`w-14 h-full flex items-center justify-center shrink-0 ${iconColor}`}>{icon}</div>
      <div className="flex-1 h-full flex flex-col items-start justify-center pr-4 overflow-hidden">
        <span className={`font-bold text-sm uppercase truncate w-full text-left ${textColor}`}>{text}</span>
        {subtext && <span className={`text-[10px] font-bold uppercase truncate w-full text-left ${subtextColor}`}>{subtext}</span>}
      </div>
    </button>
  );
};

const IconMovie = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>;
const IconCalendar = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>;
const IconClock = () => <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>;

export default function ReservationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    async function load() {
      const [movieData, showtimeData] = await Promise.all([
        fetchMovieById(id),
        fetchShowtimesByMovie(id),
      ]);
      setMovie(movieData);
      setShowtimes(showtimeData);

      const firstDate = showtimeData[0]?.fecha ? String(showtimeData[0].fecha).slice(0, 10) : '';
      setSelectedDate(firstDate);
    }

    load();
  }, [id]);

  const formatos = [
    { id: 'ALL', label: 'Todo el día' },
    { id: '2D', label: 'Tradicional 2D' },
    { id: 'ATMOS', label: 'Dolby Atmos' },
    { id: 'VIP', label: 'Sala VIP' },
  ];

  const fechas = useMemo(() => {
    const unique = new Map();
    for (const item of showtimes) {
      const fecha = String(item.fecha).slice(0, 10);
      if (!unique.has(fecha)) {
        unique.set(fecha, {
          full: fecha,
          dayName: new Date(`${fecha}T00:00:00`).toLocaleDateString('es-NI', { weekday: 'long' }),
          dayNum: new Date(`${fecha}T00:00:00`).toLocaleDateString('es-NI', { day: '2-digit', month: '2-digit' }),
        });
      }
    }
    return Array.from(unique.values());
  }, [showtimes]);

  const cartelera = useMemo(() => {
    const grouped = {};
    for (const slot of showtimes) {
      const fecha = String(slot.fecha).slice(0, 10);
      if (!grouped[fecha]) grouped[fecha] = [];
      grouped[fecha].push({
        id: slot.idFuncion,
        time: String(slot.hora).slice(0, 5),
        format: slot.formato || '2D',
        room: slot.tipoSala ? `Sala ${slot.sala} ${slot.tipoSala}` : `Sala ${slot.sala}`,
        price: `C$ ${Number(slot.precioBoleto || 0).toFixed(2)}`,
        raw: slot,
      });
    }
    return grouped;
  }, [showtimes]);

  const funcionesDisponibles = useMemo(() => {
    const delDia = cartelera[selectedDate] || [];
    if (selectedFormat === 'ALL') return delDia;
    return delDia.filter((f) => String(f.format).toUpperCase().includes(selectedFormat));
  }, [cartelera, selectedDate, selectedFormat]);

  const handleProceed = () => {
    if (!selectedTimeSlot || !movie) return;
    setOrderDraft({
      movie: {
        id: movieId(movie),
        title: movieTitle(movie),
        poster: moviePoster(movie),
      },
      function: selectedTimeSlot.raw,
      seats: [],
    });
    navigate('/asientos', { state: { movie, function: selectedTimeSlot.raw } });
  };

  return (
    <div className="relative min-h-screen bg-black text-white py-10 px-4 font-sans selection:bg-[#C5A03A] selection:text-black">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 bg-[#0a0a0a] p-6">
          <div>
            <h1 className="text-4xl font-black uppercase m-0 text-[#C5A03A] tracking-tight">Horarios</h1>
            <p className="text-white mt-1 uppercase text-sm font-bold tracking-widest">CineGold Managua</p>
          </div>
          <div className="text-left md:text-right bg-[#151515] p-4">
            <h2 className="text-2xl font-black text-white m-0">{movie ? movieTitle(movie) : 'Cargando...'}</h2>
            <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-wider">
              {movie?.calificacionCritica ? `Clasificación ${movie.calificacionCritica} • ${movie.duracionMinutos} min` : 'Función disponible'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-12 relative">
            <div className="absolute -inset-x-8 inset-y-0 -z-5 pointer-events-none overflow-hidden opacity-5" />

            <div>
              <h3 className="text-[#C5A03A] font-black uppercase mb-5 text-sm tracking-widest bg-[#151515] inline-block px-5 py-2">1. Formato</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {formatos.map((fmt) => (
                  <FlatButton
                    key={fmt.id}
                    icon={<IconMovie />}
                    text={fmt.label}
                    isActive={selectedFormat === fmt.id}
                    onClick={() => { setSelectedFormat(fmt.id); setSelectedTimeSlot(null); }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[#C5A03A] font-black uppercase mb-5 text-sm tracking-widest bg-[#151515] inline-block px-5 py-2">2. Fecha</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {fechas.map((f) => (
                  <FlatButton
                    key={f.full}
                    icon={<IconCalendar />}
                    text={f.dayNum}
                    subtext={f.dayName}
                    isActive={selectedDate === f.full}
                    onClick={() => { setSelectedDate(f.full); setSelectedTimeSlot(null); }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[#C5A03A] font-black uppercase mb-5 text-sm tracking-widest bg-[#151515] inline-block px-5 py-2">3. Horarios</h3>
              {funcionesDisponibles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {funcionesDisponibles.map((slot) => (
                    <FlatButton
                      key={slot.id}
                      icon={<IconClock />}
                      text={slot.time}
                      subtext={`${slot.room} • ${slot.format} • ${slot.price}`}
                      isActive={selectedTimeSlot?.id === slot.id}
                      onClick={() => setSelectedTimeSlot(slot)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#111111] p-8 text-center flex flex-col items-center justify-center min-h-[120px]">
                  <p className="text-white font-black uppercase text-lg">Sin Funciones</p>
                  <p className="text-sm font-bold text-gray-400 mt-2 uppercase">Cambia la fecha o el formato</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-6 relative z-10">
            <div className="bg-[#0a0a0a] flex flex-col overflow-hidden">
              <div className="bg-[#C5A03A] text-black font-black uppercase p-4 text-sm tracking-widest text-center">Resumen de Compra</div>

              <div className="p-6 flex-1 space-y-6 bg-[#111111] min-w-0">
                <div className="flex flex-col sm:flex-row gap-4 min-w-0">
                  <div className="w-24 h-36 bg-black shrink-0 relative mx-auto sm:mx-0">
                    <img
                      src={movie ? moviePoster(movie) : ''}
                      alt={movie ? movieTitle(movie) : 'Poster'}
                      className="w-full h-full object-cover grayscale-[15%] contrast-110 relative z-10"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-3 w-full min-w-0">
                    <div className="bg-[#1a1a1a] p-3 min-w-0">
                      <span className="text-[#C5A03A] text-[10px] font-black uppercase block tracking-wider">Película</span>
                      <span className="text-white font-black uppercase text-sm block break-words leading-tight">{movie ? movieTitle(movie) : '...'}</span>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 min-w-0">
                      <span className="text-[#C5A03A] text-[10px] font-black uppercase block tracking-wider">Sesión</span>
                      <span className="text-white text-xs font-black uppercase leading-tight mt-1 block break-words">
                        {selectedDate || '--'} <br />
                        {selectedTimeSlot ? selectedTimeSlot.time : '--:--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-5 text-xs font-black uppercase tracking-wider space-y-4 relative min-w-0">
                  <div className="flex justify-between gap-4 text-gray-400">
                    <span>SALA:</span>
                    <span className="text-white text-right break-words">{selectedTimeSlot ? selectedTimeSlot.room : '-'}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-400">
                    <span>FORMATO:</span>
                    <span className="text-white text-right break-words">{selectedTimeSlot ? selectedTimeSlot.format : '-'}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[#C5A03A] pt-4 mt-4 border-t border-[#333]">
                    <span>TOTAL:</span>
                    <span className="text-lg">{selectedTimeSlot ? selectedTimeSlot.price : 'C$ 0'}</span>
                  </div>
                </div>
              </div>

              <button
                disabled={!selectedTimeSlot}
                onClick={handleProceed}
                className={`flex w-full h-16 transition-all duration-300 ease-out relative z-10 ${!selectedTimeSlot ? 'opacity-50 cursor-not-allowed bg-[#333]' : 'cursor-pointer bg-[#C5A03A] hover:bg-[#b08d2f] hover:scale-[1.01]'}`}
              >
                <div className={`w-16 h-full flex items-center justify-center shrink-0 ${!selectedTimeSlot ? 'text-gray-500 bg-[#222]' : 'text-black bg-[#b08d2f]'}`}>
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2 7.03V18H4v-1.03c1.64-.81 2.75-2.5 2.75-4.47S5.64 8.84 4 8.03V6h16v1.03c-1.64.81-2.75 2.5-2.75 4.47s1.11 3.66 2.75 4.47zM11 9h2v2h-2zm0 4h2v2h-2z"/></svg>
                </div>
                <div className={`flex-1 h-full flex items-center justify-between px-6 uppercase font-black tracking-widest text-sm ${!selectedTimeSlot ? 'text-gray-400' : 'text-black'}`}>
                  <span>Ir a Asientos</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
