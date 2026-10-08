import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchInformationSections } from '../services/catalogService.js';

const staggerContainer = { show: { transition: { staggerChildren: 0.08 } } };
const cardVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
};

export default function InformacionPage() {
  const navigate = useNavigate();
  const [seccionesInfo, setSeccionesInfo] = useState([]);

  useEffect(() => {
    async function load() {
      const sections = await fetchInformationSections();
      setSeccionesInfo(sections);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans px-6 py-12 md:px-12 selection:bg-[#C5A03A] selection:text-black">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-16">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate(-1)}
            className="bg-white text-black px-4 py-2 font-black uppercase tracking-widest text-xs mb-8 shadow-[4px_4px_0_#C5A03A] outline-none"
          >
            ← Retorno
          </motion.button>

          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
            Centro de <span className="text-[#C5A03A] bg-[#111] px-4 shadow-[8px_8px_0_#C5A03A]">Datos</span>
          </h1>
          <p className="text-[#888] font-bold text-base md:text-lg uppercase tracking-widest max-w-3xl bg-black p-4 shadow-[inset_4px_0_0_#C5A03A]">
            Base de conocimiento general. Selecciona un módulo para acceder a los protocolos e información operativa.
          </p>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {seccionesInfo.map((sec, idx) => (
            <motion.div
              key={sec.idInformacion || idx}
              variants={cardVariant}
              className="bg-[#111] p-8 flex flex-col justify-between shadow-[8px_8px_0_black] hover:shadow-[12px_12px_0_#C5A03A] hover:-translate-y-2 transition-all group"
            >
              <div>
                <span className="inline-block bg-[#C5A03A] text-black px-3 py-1 text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_white] mb-6">
                  {sec.etiqueta || 'Información'}
                </span>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4 group-hover:text-white transition-colors">
                  {sec.titulo}
                </h3>
                <p className="text-[#888] font-bold text-sm tracking-wider leading-relaxed">
                  {sec.descripcion}
                </p>
              </div>

              <button
                onClick={() => alert(`Accediendo a base de datos: ${sec.titulo}`)}
                className="mt-10 w-full bg-[#222] text-white font-black py-4 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black shadow-[4px_4px_0_black] group-hover:shadow-[6px_6px_0_#C5A03A] transition-all outline-none"
              >
                Extraer Datos
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
