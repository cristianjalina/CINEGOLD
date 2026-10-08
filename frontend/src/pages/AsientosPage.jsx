import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSeatsByFunction } from '../services/catalogService.js';
import { moviePoster, movieTitle } from '../utils/catalogMappers.js';
import { mergeOrderDraft } from '../utils/orderDraft.js';

const Seat = ({ isSelected, isOccupied, onClick, label }) => {
  const baseClass = 'w-10 h-10 flex items-center justify-center text-[10px] font-black transition-all duration-300 cursor-pointer border-none';
  let stateClass = '';
  if (isOccupied) {
    stateClass = 'bg-[#991B1B] text-[#550000] cursor-not-allowed';
  } else if (isSelected) {
    stateClass = 'bg-[#C5A03A] text-black hover:bg-[#D4AF37]';
  } else {
    stateClass = 'bg-[#1A1A1A] text-white hover:bg-[#333333]';
  }

  return (
    <button onClick={onClick} disabled={isOccupied} className={`${baseClass} ${stateClass}`}>
      {label}
    </button>
  );
};

const Legend = () => (
  <div className="flex justify-center gap-8 border-y border-[#222] py-6 w-full">
    <div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#1A1A1A]"></div><span className="text-[10px] uppercase font-bold text-white tracking-widest">Disponible</span></div>
    <div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#C5A03A]"></div><span className="text-[10px] uppercase font-bold text-white tracking-widest">Seleccionado</span></div>
    <div className="flex items-center gap-3"><div className="w-5 h-5 bg-[#991B1B]"></div><span className="text-[10px] uppercase font-bold text-white tracking-widest">Ocupado</span></div>
  </div>
);

const ScreenDisplay = () => (
  <div className="w-full bg-[#151515] p-2 mb-16 text-center border-t-2 border-[#C5A03A]">
    <p className="text-[9px] text-[#C5A03A] uppercase font-black tracking-[0.5em]">Pantalla</p>
  </div>
);

const BookingFooter = ({ selected, onProceed, totalLabel }) => (
  <div className="flex justify-between items-center bg-[#0A0A0A] p-6 border-t border-[#222]">
    <div className="flex flex-col gap-1">
      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Butacas seleccionadas</span>
      <span className="text-sm font-black text-white tracking-wider">{selected.length > 0 ? selected.join(', ') : 'Ninguna seleccionada'}</span>
      <span className="text-xs font-bold text-[#C5A03A] uppercase tracking-widest mt-1">{totalLabel}</span>
    </div>

    <button
      disabled={selected.length === 0}
      onClick={onProceed}
      className={`px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selected.length > 0 ? 'bg-[#C5A03A] text-black hover:bg-[#D4AF37] hover:scale-[1.01]' : 'bg-[#1A1A1A] text-[#444] cursor-not-allowed'}`}
    >
      Proceder al Pago
    </button>
  </div>
);

export default function AsientosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState([]);
  const [seats, setSeats] = useState([]);

  const movie = location.state?.movie || null;
  const selectedFunction = location.state?.function || null;

  useEffect(() => {
    async function load() {
      if (!selectedFunction?.idFuncion) return;
      const seatData = await fetchSeatsByFunction(selectedFunction.idFuncion);
      setSeats(seatData);
    }

    load();
  }, [selectedFunction]);

  const structure = useMemo(() => {
    const rows = {};
    for (const seat of seats) {
      const fila = seat.fila || 'A';
      if (!rows[fila]) rows[fila] = [];
      rows[fila].push(seat);
    }
    return rows;
  }, [seats]);

  const toggleAsiento = (seat) => {
    if (seat.estado === 'ocupado') return;
    setSelected((prev) => {
      const exists = prev.find((item) => item.idAsiento === seat.idAsiento);
      if (exists) {
        return prev.filter((item) => item.idAsiento !== seat.idAsiento);
      }
      return [...prev, seat];
    });
  };

  const handleProceed = () => {
    mergeOrderDraft({
      movie: movie ? {
        id: movie.idPelicula,
        title: movieTitle(movie),
        poster: moviePoster(movie),
      } : null,
      function: selectedFunction,
      seats: selected,
    });
    navigate('/pago', { state: { movie, function: selectedFunction, seats: selected } });
  };

  const totalLabel = selectedFunction ? `C$ ${(Number(selectedFunction.precioBoleto || 0) * selected.length).toFixed(2)}` : 'C$ 0.00';

  return (
    <div className="min-h-screen bg-black py-10 px-4 font-sans text-white">
      <div className="max-w-5xl mx-auto border border-[#222] bg-[#050505]">
        <div className="p-8 border-b border-[#222]">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Selección de Asientos</h1>
          <p className="text-[10px] text-[#C5A03A] uppercase font-bold tracking-widest mt-1">
            {movie ? `Sala VIP • ${movieTitle(movie)}` : 'Sala VIP • CineGold'}
          </p>
        </div>

        <div className="p-10">
          <ScreenDisplay />

          <div className="flex flex-col items-center gap-3 mb-16">
            {Object.keys(structure).sort().map((fila) => (
              <div key={fila} className="flex items-center gap-8">
                <span className="text-[10px] text-[#444] font-black w-4">{fila}</span>
                <div className="flex gap-2">
                  {structure[fila].map((seat) => (
                    <Seat
                      key={seat.idAsiento}
                      label={seat.numero}
                      isSelected={selected.some((item) => item.idAsiento === seat.idAsiento)}
                      isOccupied={seat.estado === 'ocupado'}
                      onClick={() => toggleAsiento(seat)}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#444] font-black w-4">{fila}</span>
              </div>
            ))}
          </div>

          <Legend />
        </div>

        <BookingFooter selected={selected.map((seat) => `${seat.fila}${seat.numero}`)} onProceed={handleProceed} totalLabel={totalLabel} />
      </div>
    </div>
  );
}
