import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { processTicketPurchase } from '../services/checkoutService.js';
import { formatCurrency } from '../utils/formatters.js';
import { getOrderDraft, clearOrderDraft } from '../utils/orderDraft.js';

function formatFunctionLabel(fn) {
  if (!fn) return 'Sin funcion';
  const room = fn.nombreCine
    ? fn.nombreCine + ' - Sala ' + (fn.numeroSala || fn.idSala || '--')
    : 'Sala ' + (fn.numeroSala || fn.idSala || '--');
  const date = fn.fecha ? String(fn.fecha).slice(0, 10) : '--/--/----';
  const time = fn.hora ? String(fn.hora).slice(0, 5) : '--:--';
  const format = fn.formatoBadge || fn.formato || 'Formato no disponible';
  return room + ' | ' + date + ' ' + time + ' | ' + format;
}

const paymentSchema = z.object({
  titularTarjeta: z.string().min(3, 'Ingresa el nombre en la tarjeta'),
  numeroTarjeta: z.string().min(4, 'Formato de tarjeta inválido'),
  fechaVencimiento: z.string().min(4, 'Formato MM/AA'),
  cvv: z.string().min(3, 'CVV inválido'),
  correo: z.string().email('Correo inválido'),
});

export default function PagoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationDraft = location.state || {};
  const storedDraft = getOrderDraft();
  const draft = useMemo(() => {
    if (locationDraft.candy && !locationDraft.function && !locationDraft.movie) {
      return { movie: null, function: null, seats: [], candy: locationDraft.candy || [] };
    }
    return { ...storedDraft, ...locationDraft };
  }, [locationDraft, storedDraft]);
  const hasTicketFlow = Boolean(draft.seats?.length || draft.function?.idFuncion || draft.function?.IdFuncion);
  const paymentDraft = useMemo(() => {
    if (hasTicketFlow) return draft;
    return { ...draft, movie: null, function: null, seats: [] };
  }, [draft, hasTicketFlow]);
  const [completado, setCompletado] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    titularTarjeta: '',
    numeroTarjeta: '',
    fechaVencimiento: '',
    cvv: '',
    correo: '',
  });

  const seatCount = paymentDraft.seats?.length || 0;
  const candyTotal = (paymentDraft.candy || []).reduce((sum, item) => sum + Number(item.precioUnitario || 0) * Number(item.cantidad || 0), 0);
  const ticketTotal = seatCount * Number(paymentDraft.function?.precioBoleto || 0);
  const finalTotal = ticketTotal + candyTotal;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePago = async (e) => {
    e.preventDefault();
    setError('');

    const parsed = paymentSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Formulario inválido');
      return;
    }

    try {
      await processTicketPurchase({
        idFuncion: paymentDraft.function?.idFuncion || paymentDraft.function?.IdFuncion || null,
        idAsiento: paymentDraft.seats?.[0]?.idAsiento || null,
        asientos: (paymentDraft.seats || []).map((seat) => ({ idAsiento: seat.idAsiento })),
        dulceria: (paymentDraft.candy || []).map((item) => ({
          idReferencia: Number(item.idReferencia),
          tipo: item.tipo,
          cantidad: Number(item.cantidad),
        })),
        pago: {
          titularTarjeta: formData.titularTarjeta,
          numeroTarjeta: parsed.data.numeroTarjeta,
          fechaVencimiento: parsed.data.fechaVencimiento,
          cvv: parsed.data.cvv,
        },
        correo: formData.correo,
        idMetodoPago: 1,
        precioBoleto: Number(paymentDraft.function?.precioBoleto || 0),
      });

      clearOrderDraft();
      setCompletado(true);
    } catch (submitError) {
      setError(submitError.message || 'No se pudo procesar el pago');
    }
  };

  if (completado) {
    return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black py-20">
        <div className="max-w-[1920px] mx-auto px-6 md:px-16">
          <div className="bg-[#111] p-12 text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-24 h-24 bg-[#D4AF37] flex items-center justify-center text-black text-5xl font-black mb-8">✓</div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">¡Transacción Exitosa!</h2>
            <p className="text-gray-400 text-sm font-bold mt-6 uppercase tracking-widest max-w-md">Tus boletos y productos han sido registrados.</p>
            <button onClick={() => navigate('/')} className="mt-12 bg-white text-black font-black uppercase tracking-widest px-8 py-5 hover:bg-[#D4AF37] transition-colors w-full sm:w-auto outline-none">
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black py-20">
      <div className="max-w-[1920px] mx-auto px-6 md:px-16">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Finalizar Compra</h1>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-black">
            <div className="bg-[#D4AF37] px-4 py-3">1. Funcion</div>
            <div className="bg-[#D4AF37] px-4 py-3">2. Asientos</div>
            <div className="bg-[#D4AF37] px-4 py-3">3. Pago</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-[#111] p-8 md:p-12">
            <h2 className="text-xl md:text-2xl font-black text-[#D4AF37] uppercase tracking-widest mb-10">Información de Pago</h2>

            <form onSubmit={handlePago} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Nombre en la Tarjeta</label>
                <input type="text" name="titularTarjeta" value={formData.titularTarjeta} onChange={handleChange} required className="w-full bg-[#050505] p-5 text-white font-black uppercase outline-none focus:bg-white focus:text-black transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Número de Tarjeta</label>
                <input type="text" name="numeroTarjeta" value={formData.numeroTarjeta} onChange={handleChange} maxLength="23" inputMode="numeric" placeholder="0000 0000 0000 0000" required className="w-full bg-[#050505] p-5 text-white font-black uppercase outline-none focus:bg-white focus:text-black transition-colors placeholder:text-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Expiración</label>
                  <input type="text" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} placeholder="MM/AA" required className="w-full bg-[#050505] p-5 text-white font-black uppercase text-center outline-none focus:bg-white focus:text-black transition-colors placeholder:text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">CVV</label>
                  <input type="password" name="cvv" value={formData.cvv} onChange={handleChange} maxLength="4" inputMode="numeric" placeholder="***" required className="w-full bg-[#050505] p-5 text-white font-black text-center outline-none focus:bg-white focus:text-black transition-colors placeholder:text-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Correo</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="w-full bg-[#050505] p-5 text-white font-black uppercase outline-none focus:bg-white focus:text-black transition-colors" />
              </div>

              {error ? <div className="bg-red-600/20 border border-red-500 text-red-200 text-xs font-bold uppercase tracking-widest p-3">{error}</div> : null}

              <button type="submit" className="w-full bg-[#D4AF37] hover:bg-white text-black font-black uppercase tracking-widest py-6 mt-4 transition-colors outline-none">
                Confirmar y Procesar Reserva
              </button>
            </form>
          </div>

          <div className="bg-[#D4AF37] text-black p-8 md:p-12 h-fit">
            <h3 className="font-black text-2xl uppercase tracking-widest mb-10">Resumen</h3>

            <div className="space-y-6 text-sm font-black uppercase tracking-wider text-black/70">
              <div className="flex justify-between items-center">
                <span>Película:</span>
                <span className="text-black text-base">{paymentDraft.movie?.title || 'Solo dulcería'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Boletos:</span>
                <span className="text-black text-base">{seatCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dulcería:</span>
                <span className="text-black text-base">{formatCurrency(candyTotal)}</span>
              </div>
            </div>

            <div className="mt-12 bg-[#050505] text-white p-8 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-2">Total General</span>
              <span className="text-5xl font-black leading-none">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

