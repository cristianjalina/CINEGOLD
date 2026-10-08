import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    correo: z.string().email(),
    password: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const registerClientSchema = z.object({
  body: z.object({
    identificacion: z.string().max(50).optional().nullable(),
    nombre: z.string().min(1).max(100),
    apellido: z.string().max(100).optional().nullable(),
    nickname: z.string().max(150).optional().nullable(),
    correo: z.string().email().max(100),
    telefono: z.string().max(20).optional().nullable(),
    password: z.string().min(8).max(128),
    idTipoCliente: z.coerce.number().int().positive().optional().nullable(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const cinegoldPlusActivationSchema = z.object({
  body: z.object({
    nombre: z.string().min(3).max(180),
    correo: z.string().email().max(100),
    codigo: z.string().min(8).max(20),
    terminos: z.literal(true),
  }),
  params: z.object({}),
  query: z.object({}),
});
