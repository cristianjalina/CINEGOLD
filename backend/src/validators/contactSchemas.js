import { z } from 'zod';

export const contactSchema = z.object({
  body: z.object({
    nombreRemitente: z.string().min(1).max(255),
    correoRemitente: z.string().email().max(100),
    mensaje: z.string().min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});
