import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchCombos } from '../services/catalogService.js';
import { formatCurrency } from '../utils/formatters.js';
import { setOrderDraft } from '../utils/orderDraft.js';

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-6 h-6">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-6 h-6">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

export default function DulceriaPage() {
  const navigate = useNavigate();
  const fallbackImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200';
  const [cart, setCart] = useState({});
  const [filtro, setFiltro] = useState('Todos');
  const [products, setProducts] = useState([]);

  const itemKey = (product) => `${product.tipo || 'producto'}-${product.id}`;

  useEffect(() => {
    async function load() {
      const data = await fetchCombos();
      setProducts(data);
    }
    load();
  }, []);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map((p) => p.categoria).filter(Boolean)))], [products]);

  const updateCart = (key, delta) => {
    setCart((prev) => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const newCart = { ...prev };
        delete newCart[key];
        return newCart;
      }
      return { ...prev, [key]: next };
    });
  };

  const total = Object.entries(cart).reduce((acc, [id, qty]) => {
    const prod = products.find((p) => itemKey(p) === String(id));
    return acc + (prod ? Number(prod.precio || 0) * qty : 0);
  }, 0);

  const totalItems = Object.values(cart).reduce((acc, qty) => acc + qty, 0);
  const filteredProducts = filtro === 'Todos' ? products : products.filter((p) => p.categoria === filtro);

  const handleProceed = () => {
    const candy = Object.entries(cart).map(([id, cantidad]) => {
      const prod = products.find((item) => itemKey(item) === String(id));
      return {
        idReferencia: Number(prod?.idReferencia || id),
        tipo: prod?.tipo || 'producto',
        cantidad,
        nombre: prod?.nombre,
        precioUnitario: prod?.precio,
      };
    });

    setOrderDraft({
      movie: null,
      function: null,
      seats: [],
      candy,
    });
    navigate('/pago', { state: { movie: null, function: null, seats: [], candy } });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#C5A03A] selection:text-black pb-32">
      <div className="relative bg-[#111] overflow-hidden pt-28 pb-16 px-6 md:px-12 shadow-[0_12px_0_#C5A03A]">
        <div className="relative z-10 max-w-[1920px] mx-auto flex flex-col lg:flex-row items-end justify-between gap-12">
          <div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] m-0 text-white mix-blend-difference">
              CANDY<br /><span className="text-[#C5A03A]">BAR</span>
            </h1>
            <p className="text-white text-lg md:text-2xl font-black tracking-[0.4em] uppercase mt-6 bg-[#C5A03A] text-black inline-block px-6 py-3 rounded-none shadow-[6px_6px_0_white]">
              El complemento perfecto
            </p>
          </div>

          <div className="bg-[#0a0a0a] p-8 min-w-[320px] w-full lg:w-auto shadow-[12px_12px_0_#C5A03A]">
            <div className="flex items-center justify-between mb-6 pb-6 bg-[#0a0a0a] relative">
              <span className="font-black text-3xl uppercase tracking-widest text-white">Tu Orden</span>
              <div className="text-[#C5A03A]"><IconCart /></div>
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[#222]"></div>
            </div>
            <div className="text-5xl font-black text-[#C5A03A] tracking-tighter">
              {formatCurrency(total)}
            </div>
            <p className="text-sm font-bold text-[#888] tracking-widest uppercase mt-2">
              {totalItems} ítems seleccionados
            </p>
            <button
              disabled={totalItems === 0}
              onClick={handleProceed}
              className="mt-8 w-full bg-[#C5A03A] text-black font-black uppercase tracking-[0.2em] py-5 text-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 rounded-none shadow-[6px_6px_0_white] hover:shadow-[10px_10px_0_#C5A03A] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0_white] disabled:hover:bg-[#C5A03A] outline-none"
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 mt-24 mb-20">
        <div className="flex flex-wrap gap-4 md:gap-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-8 py-5 text-xl md:text-2xl font-black uppercase tracking-widest transition-all duration-300 rounded-none outline-none ${
                filtro === cat
                  ? 'bg-[#C5A03A] text-black shadow-[8px_8px_0_white] -translate-y-1'
                  : 'bg-[#111] text-white shadow-[8px_8px_0_#000] hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[8px_8px_0_#C5A03A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={itemKey(product)}
                className="bg-[#111] shadow-[12px_12px_0_#000] hover:shadow-[16px_16px_0_#C5A03A] hover:-translate-y-2 transition-all duration-300 flex flex-col rounded-none relative group"
              >
                <div className="absolute top-6 left-6 z-20 bg-white text-black font-black uppercase tracking-widest text-sm px-5 py-2 shadow-[6px_6px_0_#C5A03A]">
                  {product.categoria}
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-black">
                  <img
                    src={product.imagenUrl || fallbackImage}
                    alt={product.nombre}
                    className="w-full h-full object-cover grayscale-[40%] contrast-125 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                </div>

                <div className="p-8 flex flex-col flex-1 justify-between bg-[#0a0a0a]">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-4">
                      {product.nombre}
                    </h2>
                    <p className="text-[#888] font-bold text-xs md:text-sm uppercase tracking-wider leading-relaxed">
                      {product.descripcion}
                    </p>
                  </div>

                  <div className="mt-10 flex items-end justify-between">
                    <div className="text-4xl md:text-5xl font-black text-[#C5A03A] tracking-tighter">
                      <span className="text-2xl mr-1">C$</span>{Number(product.precio || 0).toFixed(2)}
                    </div>

                    <div className="flex items-stretch shadow-[6px_6px_0_white]">
                      <button onClick={() => updateCart(itemKey(product), -1)} className="w-12 md:w-14 h-14 md:h-16 flex items-center justify-center bg-black text-white hover:bg-[#C5A03A] hover:text-black transition-colors outline-none">
                        <IconMinus />
                      </button>
                      <div className="w-12 md:w-16 h-14 md:h-16 flex items-center justify-center font-black text-2xl text-black bg-white">
                        {cart[itemKey(product)] || 0}
                      </div>
                      <button onClick={() => updateCart(itemKey(product), 1)} className="w-12 md:w-14 h-14 md:h-16 flex items-center justify-center bg-[#C5A03A] text-black hover:bg-white hover:text-black transition-colors outline-none">
                        <IconPlus />
                      </button>
                    </div>
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
