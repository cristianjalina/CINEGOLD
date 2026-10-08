import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { activateCinegoldPlus } from '../services/authService.js';

const formSchema = z.object({
  nombre: z.string().min(3, 'Ingresa tu nombre completo'),
  correo: z.string().email('Correo inválido'),
  codigo: z.string().min(8, 'Código demasiado corto').max(20),
  terminos: z.literal(true),
});

export default function CinegoldPlusPage() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', codigo: '', terminos: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsed = formSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Formulario inválido');
      return;
    }

    try {
      await activateCinegoldPlus(formData);
      setSuccess('Tu tarjeta ha sido activada y tu cuenta quedó como miembro.');
    } catch (submitError) {
      setError(submitError.message || 'No se pudo activar Cinegold Plus');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-[#D4AF37] selection:text-black overflow-hidden relative cursor-none md:cursor-auto pb-32">
      <div className="relative w-full max-w-[1920px] mx-auto px-6 md:px-16 pt-32 pb-20 flex flex-col lg:flex-row items-center justify-between gap-16 z-10">
        <div className="flex-1 text-left">
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}>
            <span className="inline-block bg-[#D4AF37] text-black px-4 py-2 font-black text-sm uppercase tracking-[0.25em] mb-6 shadow-[4px_4px_0_white] rounded-none">
              Programa de Lealtad Premium
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none comic-title mb-8">
              CINEGOLD <br /> <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#CC7722,#FFB800,#FFFFFF)]">PLUS</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white/80 max-w-2xl mb-10 leading-tight">
              OBTÉN HASTA <span className="text-[#D4AF37] font-black">7.5% DE CASHBACK</span> EN TUS COMPRAS Y DISFRUTA DE BENEFICIOS EXCLUSIVOS TODOS LOS DÍAS.
            </p>
          </motion.div>
        </div>

        <motion.div className="flex-1 w-full max-w-lg perspective-1000" initial={{ opacity: 0, scale: 0.8, rotateY: 45 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ type: 'spring', duration: 1.5, delay: 0.4 }} whileHover={{ rotateY: 15, rotateX: 10, scale: 1.05 }}>
          <div className="w-full aspect-[1.6/1] bg-[#111] p-8 flex flex-col justify-between shadow-[16px_16px_0_#D4AF37] rounded-none border-4 border-[#D4AF37] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex justify-between items-start z-10">
              <h2 className="text-3xl font-black text-white tracking-tighter comic-title">CINEGOLD</h2>
              <span className="bg-white text-black px-2 py-1 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0_#D4AF37]">PLUS +</span>
            </div>
            <div className="z-10">
              <div className="w-12 h-8 bg-gradient-to-r from-yellow-600 to-yellow-400 mb-4 rounded-none shadow-[2px_2px_0_black]"></div>
              <p className="text-[#D4AF37] font-mono text-xl md:text-2xl tracking-[0.2em] mb-2 shadow-black drop-shadow-md">**** **** **** 9284</p>
              <div className="flex justify-between text-white/60 text-xs font-black uppercase tracking-widest">
                <span>Válida por 1 Año</span>
                <span>Miembro VIP</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-20 relative z-20">
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="bg-white p-8 shadow-[12px_12px_0_#D4AF37] transition-transform hover:-translate-y-2">
            <h3 className="text-5xl font-black text-black mb-4 comic-title tracking-tighter">7.5%</h3>
            <h4 className="text-xl font-black text-black uppercase mb-4 tracking-widest">Cashback Directo</h4>
            <p className="text-black/80 font-bold leading-relaxed">Acumula saldo inmediatamente por cada compra en taquilla, dulcería y quioscos, hasta por un monto de C$290.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-[#D4AF37] p-8 shadow-[12px_12px_0_white] transition-transform hover:-translate-y-2">
            <h3 className="text-5xl font-black text-black mb-4 comic-title tracking-tighter">24/7</h3>
            <h4 className="text-xl font-black text-black uppercase mb-4 tracking-widest">Beneficios Diarios</h4>
            <p className="text-black/90 font-bold leading-relaxed">Ascensos diferentes todos los días de la semana en taquilla y dulcería.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-[#111] border-2 border-[#D4AF37] p-8 shadow-[12px_12px_0_#D4AF37] transition-transform hover:-translate-y-2">
            <h3 className="text-5xl font-black text-white mb-4 comic-title tracking-tighter">365</h3>
            <h4 className="text-xl font-black text-[#D4AF37] uppercase mb-4 tracking-widest">Días de Vigencia</h4>
            <p className="text-white/80 font-bold leading-relaxed">Disfruta tus beneficios durante un (1) año completo a partir de tu fecha de compra.</p>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full bg-white py-24 px-6 md:px-16 my-20">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter comic-title leading-none mb-16 text-center md:text-left">
            REGLAS DEL JUEGO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-6 items-start">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-[linear-gradient(45deg,#000,#555)] comic-title">01</span>
              <div>
                <h4 className="text-2xl font-black text-black uppercase mb-2">Adquisición</h4>
                <p className="font-bold text-gray-800">La Tarjeta Plus puede activarse completando este formulario y validando el correo.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-[linear-gradient(45deg,#000,#555)] comic-title">02</span>
              <div>
                <h4 className="text-2xl font-black text-black uppercase mb-2">Acumulación Inmediata</h4>
                <p className="font-bold text-gray-800">El sistema marcará tu cuenta como miembro para habilitar los beneficios.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-[linear-gradient(45deg,#000,#555)] comic-title">03</span>
              <div>
                <h4 className="text-2xl font-black text-black uppercase mb-2">Activación Digital</h4>
                <p className="font-bold text-gray-800">Tu estado de miembro queda listo en el backend al completar la solicitud.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-20">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 100 }} className="bg-[#111] p-8 md:p-12 shadow-[16px_16px_0_#D4AF37]">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter comic-title mb-4">ACTIVA TU TARJETA</h2>
            <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm">Ingresa tus datos y el código de tu recibo para comenzar.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white font-black uppercase tracking-widest text-xs">Nombre Completo</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full bg-white text-black font-black uppercase px-4 py-4 outline-none rounded-none shadow-[6px_6px_0_#D4AF37] focus:shadow-[8px_8px_0_white] transition-shadow" placeholder="EL MERO CRISTIAN JALINA" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white font-black uppercase tracking-widest text-xs">Correo Electrónico</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="w-full bg-white text-black font-black uppercase px-4 py-4 outline-none rounded-none shadow-[6px_6px_0_#D4AF37] focus:shadow-[8px_8px_0_white] transition-shadow placeholder-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white font-black uppercase tracking-widest text-xs">Código de Activación (12 Dígitos)</label>
              <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required maxLength="12" className="w-full bg-[#D4AF37] text-black font-black uppercase tracking-[0.3em] px-4 py-4 outline-none rounded-none shadow-[6px_6px_0_white] placeholder-black/40 text-lg" placeholder="XXXX-XXXX-XXXX" />
            </div>
            <label className="flex items-start gap-4 cursor-pointer mt-4 group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" name="terminos" checked={formData.terminos} onChange={handleChange} required className="appearance-none w-8 h-8 bg-white checked:bg-[#D4AF37] shadow-[4px_4px_0_white] group-hover:shadow-[4px_4px_0_#D4AF37] transition-all rounded-none outline-none cursor-pointer" />
                {formData.terminos && (
                  <svg className="absolute w-5 h-5 text-black pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <span className="text-white/80 font-bold text-xs uppercase leading-relaxed pt-1">Acepto los términos y condiciones.</span>
            </label>

            {error ? <div className="bg-red-600/20 border border-red-500 text-red-200 text-xs font-bold uppercase tracking-widest p-3">{error}</div> : null}
            {success ? <div className="bg-green-600/20 border border-green-500 text-green-200 text-xs font-bold uppercase tracking-widest p-3">{success}</div> : null}

            <button type="submit" className="mt-8 bg-white text-black font-black text-xl md:text-2xl py-6 uppercase tracking-widest shadow-[8px_8px_0_#D4AF37] hover:bg-[#D4AF37] hover:shadow-[8px_8px_0_white] transition-all duration-300 outline-none active:translate-y-2 active:shadow-none">
              ACTIVAR AHORA
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
