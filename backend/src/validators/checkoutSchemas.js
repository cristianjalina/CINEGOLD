import { z } from 'zod';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const candyItemSchema = z.object({
  idReferencia: z.any().transform(toNumber).nullable(),
  tipo: z.string().optional().default('producto'),
  cantidad: z.any().transform(toNumber).nullable(),
});

const seatSchema = z.object({
  idAsiento: z.any().transform(toNumber).nullable(),
});

export const checkoutSchema = z.object({
  body: z.object({
    idFuncion: z.any().transform(toNumber).nullable().optional(),
    idAsiento: z.any().transform(toNumber).nullable().optional(),
    asientos: z.array(seatSchema).optional().default([]),
    dulceria: z.array(candyItemSchema).optional().default([]),
    idCliente: z.any().transform(toNumber).nullable().optional(),
    idUsuario: z.any().transform(toNumber).nullable().optional(),
    idCine: z.any().transform(toNumber).nullable().optional(),
    idMetodoPago: z.any().transform((value) => toNumber(value) || 1).default(1),
    precioBoleto: z.any().transform(toNumber).nullable().optional(),
    correo: z.string().max(100).optional().nullable(),
    pago: z
      .object({
        titularTarjeta: z.string().min(1).max(255),
        numeroTarjeta: z.string().min(1).max(50),
        fechaVencimiento: z.string().min(1).max(10),
        cvv: z.string().min(1).max(10).optional().nullable(),
      })
      .optional()
      .nullable(),
  }),
  params: z.object({}),
  query: z.object({}),
}).superRefine((value, ctx) => {
  const hasSeats = (value.body.asientos || []).length > 0 || value.body.idAsiento != null;
  const hasCandy = (value.body.dulceria || []).length > 0;
  if (!hasSeats && !hasCandy) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debes seleccionar asientos, dulceria o ambos para continuar.',
      path: ['body'],
    });
  }

  if (hasSeats && !value.body.idFuncion) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La compra de boletos requiere una funcion valida.',
      path: ['body', 'idFuncion'],
    });
  }
});
