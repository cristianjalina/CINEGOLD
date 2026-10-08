import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPromotions } from '../services/catalogService.js';

const brutalSpring = { type: 'spring', stiffness: 400, damping: 25 };

const PremiumBadge = () => (
  <motion.div className="absolute -top-5 -right-5 z-20" initial={{ opacity: 0, scale: 0, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 6 }} transition={brutalSpring}>
    <div className="bg-[#C5A03A] px-5 py-3 shadow-[8px_8px_0_white]">
      <span className="text-sm md:text-base font-black tracking-[0.2em] text-black uppercase">Válido Hoy</span>
    </div>
  </motion.div>
);

const BrutalTitle = ({ text, className }) => {
  const letters = Array.from(text);
  return (
    <motion.h1 initial="hidden" animate="show" className={`flex flex-wrap overflow-hidden ${className}`}>
      {letters.map((letter, i) => (
        <motion.span key={i} initial={{ y: 100, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1, transition: brutalSpring }} className="inline-block mix-blend-difference">
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState('TODAS');
  const [selectedId, setSelectedId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [promos, setPromos] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchPromotions();
      setPromos(data);
      setSelectedId(data[0]?.idPromocion || null);
    }
    load();
  }, []);

  useEffect(() => {
    const reload = () => fetchPromotions().then((data) => {
      setPromos(data);
      setSelectedId((current) => current || data[0]?.idPromocion || null);
    });
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

  const filteredPromos = useMemo(
    () => promos.filter((p) => {
      const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      if (normalize(activeTab) === 'TODAS') return true;
      return normalize(p.categoria || 'TAQUILLA') === normalize(activeTab);
    }),
    [activeTab, promos],
  );

  const handleApplyPromo = (id) => {
    setAddingId(id);
    const selected = promos.find((promo) => promo.idPromocion === id);
    setStatusMessage(selected ? `Promoción "${selected.nombre}" aplicada.` : 'Promoción aplicada.');
    setTimeout(() => setAddingId(null), 800);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative antialiased flex flex-col items-center selection:bg-[#C5A03A] selection:text-black pb-32">
      <div className="relative w-full bg-[#111] overflow-hidden pt-28 pb-16 px-6 md:px-12 z-10 shadow-[0_12px_0_#C5A03A]">
        <div className="max-w-[1920px] mx-auto relative z-10 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={brutalSpring} className="bg-white text-black inline-block px-5 py-2 text-xs md:text-sm font-black tracking-[0.3em] uppercase mb-6 shadow-[6px_6px_0_#C5A03A]">
              Exclusivas
            </motion.div>
            <div className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85]">
              <BrutalTitle text="PROMO" />
              <div className="text-[#C5A03A]"><BrutalTitle text="CIONES" /></div>
            </div>
          </div>

          <div className="flex gap-4 md:gap-8 w-full md:w-auto">
            {['TODAS', 'TAQUILLA', 'DULCERÍA'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-5 md:px-10 md:py-6 text-xl md:text-2xl font-black uppercase tracking-widest transition-all duration-300 rounded-none outline-none ${
                  activeTab === tab
                    ? 'bg-[#C5A03A] text-black shadow-[8px_8px_0_white] -translate-y-2'
                    : 'bg-black text-[#888] shadow-[8px_8px_0_#222] hover:bg-white hover:text-black hover:-translate-y-2 hover:shadow-[8px_8px_0_#C5A03A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto w-full px-6 md:px-12 mt-24 relative z-20">
        {statusMessage ? (
          <div className="mb-8 bg-white text-black font-black uppercase tracking-[0.2em] px-5 py-4 shadow-[8px_8px_0_#C5A03A]">
            {statusMessage}
          </div>
        ) : null}
        {filteredPromos.length === 0 ? (
          <div className="bg-[#111] text-white p-10 shadow-[8px_8px_0_#C5A03A]">
            <h2 className="text-3xl font-black uppercase tracking-tighter">No hay promociones en esta categoría</h2>
            <p className="mt-3 text-[#aaa] font-bold uppercase tracking-widest text-sm">
              Cambia a Todas para ver las promociones vigentes registradas.
            </p>
          </div>
        ) : null}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20">
          <AnimatePresence mode="popLayout">
            {filteredPromos.map((promo) => (
              <motion.div
                key={promo.idPromocion}
                layout
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={brutalSpring}
                onClick={() => setSelectedId(promo.idPromocion)}
                className={`group relative flex flex-col cursor-pointer transition-all duration-300 rounded-none ${selectedId === promo.idPromocion ? 'bg-[#111] shadow-[16px_16px_0_#C5A03A] -translate-y-3' : 'bg-black shadow-[8px_8px_0_#222] hover:shadow-[12px_12px_0_white] hover:-translate-y-1'}`}
              >
                {selectedId === promo.idPromocion && <PremiumBadge />}

                <div className="w-full h-72 md:h-[350px] overflow-hidden relative bg-[#222]">
                  <motion.img
                    src={promo.imagenUrl || 'https://via.placeholder.com/800x600?text=Promocion'}
                    alt={promo.nombre}
                    initial={false}
                    animate={{ scale: selectedId === promo.idPromocion ? 1.05 : 1 }}
                    transition={{ duration: 0.7 }}
                    className={`w-full h-full object-cover transition-all duration-700 ${selectedId === promo.idPromocion ? 'grayscale-0' : 'grayscale-[80%] contrast-125 group-hover:grayscale-0'}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Promocion';
                    }}
                  />
                  <div className="absolute bottom-4 left-4 bg-white px-4 py-2 text-xs font-black tracking-widest text-black uppercase shadow-[4px_4px_0_#C5A03A]">
                    {String(promo.categoria || activeTab).toUpperCase()}
                  </div>
                </div>

                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">
                    {promo.nombre}
                  </h3>

                  <div className="min-h-[90px]">
                    <AnimatePresence mode="wait">
                      {selectedId === promo.idPromocion && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="text-[#aaa] font-bold tracking-widest text-sm md:text-base uppercase leading-relaxed">
                          {promo.descripcion}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between relative pt-8 gap-6">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#222]"></div>
                    <span className="text-4xl md:text-5xl font-black text-[#C5A03A] tracking-tighter">
                      {promo.precioEtiqueta || `${Number(promo.porcentajeDescuento || 0)}%`}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95, y: 5, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyPromo(promo.idPromocion);
                      }}
                      className={`relative font-black uppercase text-sm md:text-base tracking-[0.2em] px-8 py-5 transition-all duration-300 rounded-none outline-none ${selectedId === promo.idPromocion ? 'bg-white text-black shadow-[6px_6px_0_#C5A03A] hover:bg-[#C5A03A] hover:shadow-[6px_6px_0_white]' : 'bg-[#222] text-white shadow-[6px_6px_0_black] hover:bg-white hover:text-black hover:shadow-[6px_6px_0_#C5A03A]'}`}
                    >
                      {addingId === promo.idPromocion ? 'APLICANDO' : 'APLICAR'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
