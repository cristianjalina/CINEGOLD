import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext.jsx';

const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ correo: '', password: '', nombre: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    const parsed = loginSchema.safeParse({
      correo: formData.correo,
      password: formData.password,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Formulario inválido');
      return;
    }

    try {
      await auth.signIn({
        correo: formData.correo,
        password: formData.password,
      });
      navigate('/cartelera');
    } catch (authError) {
      setError(authError.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans selection:bg-[#C5A03A] selection:text-black">
      <motion.div layout className="w-full max-w-[450px] bg-[#111] shadow-[16px_16px_0_#C5A03A] flex flex-col">
        <motion.div layout className="p-10 bg-white text-black relative overflow-hidden">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none relative z-10">
            {isRegister ? 'Registro' : 'Inicio de'}
            <br /><span className="text-[#C5A03A]">Sesion</span>
          </h2>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A03A] -translate-y-16 translate-x-16 rotate-45"></div>
        </motion.div>

        <form onSubmit={handleAuth} className="p-10 flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div initial={{ opacity: 0, height: 0, scale: 0.9 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                <label className="block text-xs font-black text-[#888] uppercase tracking-[0.2em] mb-2">Nombre Operativo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full bg-black p-5 text-white font-bold text-sm outline-none focus:bg-[#C5A03A] focus:text-black transition-colors shadow-[4px_4px_0_#222] focus:shadow-[4px_4px_0_white]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout>
            <label className="block text-xs font-black text-[#888] uppercase tracking-[0.2em] mb-2">Correo papu</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              className="w-full bg-black p-5 text-white font-bold text-sm outline-none focus:bg-[#C5A03A] focus:text-black transition-colors shadow-[4px_4px_0_#222] focus:shadow-[4px_4px_0_white]"
            />
          </motion.div>

          <motion.div layout>
            <label className="block text-xs font-black text-[#888] uppercase tracking-[0.2em] mb-2">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-black p-5 text-white font-bold text-sm outline-none focus:bg-[#C5A03A] focus:text-black transition-colors shadow-[4px_4px_0_#222] focus:shadow-[4px_4px_0_white]"
            />
          </motion.div>

          {error ? (
            <div className="bg-red-600/20 border border-red-500 text-red-200 text-xs font-bold uppercase tracking-widest p-3">
              {error}
            </div>
          ) : null}

          <motion.button
            layout
            whileTap={{ scale: 0.95, x: 4, y: 4, boxShadow: '0px 0px 0px transparent' }}
            type="submit"
            className="w-full bg-[#C5A03A] text-black font-black uppercase tracking-[0.3em] p-6 mt-4 hover:bg-white transition-colors shadow-[8px_8px_0_white] outline-none"
          >
            {isRegister ? 'Autorizar Registro' : 'Iniciar Secuencia'}
          </motion.button>
        </form>

        <motion.div layout className="p-6 bg-black text-center relative mt-auto">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-[#222]"></div>
          <button
            type="button"
            onClick={() => {
              if (isRegister) {
                navigate('/CinegoldPlusPage');
                return;
              }
              setIsRegister(true);
            }}
            className="text-xs text-white font-black uppercase tracking-[0.2em] hover:text-[#C5A03A] transition-colors outline-none"
          >
            {isRegister ? 'Ir a Cinegold Plus →' : 'Registrarse →'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
