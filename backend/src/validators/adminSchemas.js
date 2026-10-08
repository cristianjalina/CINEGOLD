import { z } from 'zod';

const baseQuery = z.object({});

export const movieUpsertSchema = z.object({
  body: z.object({
    titulo: z.string().min(1).max(150),
    director: z.string().max(100).optional().nullable(),
    generos: z.string().max(255).optional().nullable(),
    sinopsis: z.string().optional().nullable(),
    imagenPoster: z.string().max(255).optional().nullable().default(''),
    duracionMinutos: z.number().int().positive(),
    calificacionCritica: z.number().min(0).max(10),
    esExclusivoVip: z.boolean().optional().default(false),
    proximamente: z.boolean().optional().default(false),
    trailerYoutubeId: z.string().max(50).optional().nullable(),
    imagenBackdrop: z.string().max(255).optional().nullable(),
  }),
  params: z.object({}),
  query: baseQuery,
});

export const productUpsertSchema = z.object({
  body: z.object({
    codigoTipo: z.string().min(1).max(50),
    nombreProducto: z.string().min(1).max(100),
    descripcion: z.string().max(255).optional().nullable(),
    precioActual: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    categoria: z.enum(['Snacks', 'Bebidas', 'Dulces', 'Otros']),
    imagenProducto: z.string().max(255).optional().nullable(),
  }),
  params: z.object({}),
  query: baseQuery,
});

export const comboUpsertSchema = z.object({
  body: z.object({
    codigoTipo: z.string().min(1).max(50),
    nombreCombo: z.string().min(1).max(100),
    descripcion: z.string().max(255).optional().nullable(),
    precioFijo: z.number().nonnegative(),
    estado: z.boolean().optional().default(true),
    categoria: z.string().min(1).max(50),
    imagenCombo: z.string().max(255).optional().nullable(),
  }),
  params: z.object({}),
  query: baseQuery,
});

export const promotionUpsertSchema = z.object({
  body: z.object({
    nombrePromocion: z.string().min(1).max(100),
    descripcion: z.string().max(255).optional().nullable(),
    porcentajeDescuento: z.number().min(0).max(100),
    fechaInicio: z.string().min(1),
    fechaFin: z.string().min(1),
    tipoPromocion: z.enum(['Taquilla', 'Dulceria']),
    imagenPromo: z.string().max(255).optional().nullable(),
    validezTexto: z.string().max(100).optional().nullable(),
    targets: z.array(z.object({
      tipo: z.enum(['Pelicula', 'Producto', 'Combo']),
      id: z.number().int().positive(),
    })).optional().default([]),
  }),
  params: z.object({}),
  query: baseQuery,
});

export const functionUpsertSchema = z.object({
  body: z.object({
    idPelicula: z.coerce.number().int().positive(),
    idSala: z.coerce.number().int().positive(),
    fecha: z.string().min(1),
    hora: z.string().min(1),
    idioma: z.string().min(1).max(50),
    formatoBadge: z.string().min(1).max(50),
  }),
  params: z.object({}),
  query: baseQuery,
});
