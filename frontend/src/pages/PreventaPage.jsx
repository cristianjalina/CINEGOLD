import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUpcomingMovies } from '../services/catalogService.js';
import { movieId, moviePoster, movieTitle } from '../utils/catalogMappers.js';

const FlatBlockButton = ({ rightContent, onClick, fullWidth }) => (
  <button onClick={onClick} className={`flex h-12 transition-all duration-300 ease-out cursor-pointer hover:bg-[#b08d2f] active:scale-95 shrink-0 bg-[#C5A03A] ${fullWidth ? 'w-full' : ''}`}>
    <div className="px-4 h-full flex items-center justify-center font-black text-xs md:text-sm uppercase tracking-widest text-black flex-1">{rightContent}</div>
  </button>
);

export default function PreventaPage() {
  const navigate = useNavigate();
  const [preventas, setPreventas] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchUpcomingMovies();
      setPreventas(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#0a0a0a] p-6 mb-8">
          <h1 className="text-4xl font-black uppercase m-0 text-white">Preventas</h1>
          <p className="text-[#C5A03A] mt-1 uppercase text-sm font-black tracking-widest">Acceso Anticipado</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {preventas.map((p) => (
            <div key={movieId(p)} className="bg-[#111111] flex flex-col transition-all duration-500 hover:-translate-y-2 group">
              <div className="relative overflow-hidden w-full h-80 bg-black shrink-0">
                <img src={moviePoster(p)} alt={movieTitle(p)} className="w-full h-full object-cover grayscale-[15%] contrast-110 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                <div className="absolute top-0 right-0 bg-[#C5A03A] text-black font-black text-[10px] uppercase px-3 py-1">
                  Exclusivo
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                <div>
                  <h3 className="font-black text-xl uppercase text-white truncate">{movieTitle(p)}</h3>
                  <p className="text-xs text-[#C5A03A] font-bold uppercase mt-2 tracking-wider">
                    Próximamente
                  </p>
                </div>

                <FlatBlockButton fullWidth rightContent="Adquirir Preventa" onClick={() => navigate(`/funciones/${movieId(p)}`)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
