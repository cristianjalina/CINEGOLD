import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { sendContactMessage } from '../services/contactService.js';

const brutalSpring = { type: 'spring', stiffness: 400, damping: 25 };
const contactSchema = z.object({
  nombreRemitente: z.string().min(1),
  correoRemitente: z.string().email(),
  mensaje: z.string().min(1),
});

export default function ContactoPage() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ nombreRemitente: '', correoRemitente: '', mensaje: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const parsed = contactSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Formulario inválido');
      return;
    }
    try {
      await sendContactMessage(formData);
      setEnviado(true);
    } catch (submitError) {
      setError(submitError.message || 'No se pudo enviar el mensaje');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6 selection:bg-[#C5A03A] selection:text-black pb-32">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={brutalSpring} className="w-full max-w-4xl bg-[#111] shadow-[16px_16px_0_#C5A03A] p-8 md:p-16 relative">
        <div className="absolute top-0 left-0 w-full h-[8px] bg-[#C5A03A]"></div>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
          Buzón de <br /><span className="text-[#C5A03A]">Soporte</span>
        </h1>
        <p className="text-[#888] font-bold text-sm md:text-base uppercase tracking-widest mb-10">
          ¿Incidencias con tus boletos VIP? Repórtalo aquí.
        </p>

        <AnimatePresence mode="wait">
          {enviado ? (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#C5A03A] p-8 shadow-[8px_8px_0_white]">
              <h2 className="text-2xl font-black text-black uppercase tracking-widest mb-2">¡Impacto Confirmado!</h2>
              <p className="text-black font-bold text-sm tracking-wider">Mensaje recibido. Nuestro equipo táctico te contactará en menos de 24 horas.</p>
            </motion.div>
          ) : (
            <motion.form key="form" exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-1">
                  <label className="block text-xs font-black text-white uppercase tracking-[0.2em] mb-3">Nombre Completo</label>
                  <input type="text" name="nombreRemitente" value={formData.nombreRemitente} onChange={handleChange} required className="w-full bg-[#222] p-5 text-white font-bold outline-none focus:bg-white focus:text-black transition-colors shadow-[4px_4px_0_black] focus:shadow-[8px_8px_0_#C5A03A]" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-black text-white uppercase tracking-[0.2em] mb-3">Correo Electrónico</label>
                  <input type="email" name="correoRemitente" value={formData.correoRemitente} onChange={handleChange} required className="w-full bg-[#222] p-5 text-white font-bold outline-none focus:bg-white focus:text-black transition-colors shadow-[4px_4px_0_black] focus:shadow-[8px_8px_0_#C5A03A]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-white uppercase tracking-[0.2em] mb-3">Mensaje o Sugerencia</label>
                <textarea rows="5" name="mensaje" value={formData.mensaje} onChange={handleChange} required className="w-full bg-[#222] p-5 text-white font-bold outline-none focus:bg-white focus:text-black transition-colors shadow-[4px_4px_0_black] focus:shadow-[8px_8px_0_#C5A03A] resize-none"></textarea>
              </div>
              {error ? <div className="bg-red-600/20 border border-red-500 text-red-200 text-xs font-bold uppercase tracking-widest p-3">{error}</div> : null}
              <motion.button whileTap={{ scale: 0.98, x: 4, y: 4, boxShadow: '0px 0px 0px transparent' }} type="submit" className="w-full bg-[#C5A03A] text-black font-black uppercase tracking-[0.3em] py-6 text-xl hover:bg-white transition-colors shadow-[8px_8px_0_white] outline-none">
                Enviar Reporte
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
