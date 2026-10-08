import { queryDatabase } from '../db/request.js';
import { mapDatabaseError } from '../utils/dbErrors.js';

const DEFAULT_TICKET_PRICES = {
  VIP: 240,
  IMAX: 260,
  '4DX': 280,
  REGULAR: 180,
};

const INFORMATION_FALLBACK = [
  {
    idInformacion: 1,
    titulo: 'Tarifas Taquilla',
    descripcion: 'Precios estandar para funciones 2D, 3D, VIP y promociones vigentes.',
    etiqueta: 'Tarifas',
  },
  {
    idInformacion: 2,
    titulo: 'Menu Dulceria',
    descripcion: 'Combos, nachos, hot dogs y bebidas con precios en cordobas.',
    etiqueta: 'Dulceria',
  },
  {
    idInformacion: 3,
    titulo: 'Instalaciones',
    descripcion: 'Salas regulares y premium con experiencia cinematografica completa.',
    etiqueta: 'Teatro',
  },
  {
    idInformacion: 4,
    titulo: 'Preguntas Frecuentes',
    descripcion: 'Resuelve dudas operativas, compras y reservas de forma rapida.',
    etiqueta: 'Ayuda',
  },
];

const CATALOG_FALLBACK = [
  {
    idPelicula: 1,
    titulo: 'Michael',
    director: 'Antoine Fuqua',
    sinopsis: 'Biopic definitivo del Rey del Pop.',
    imagenPoster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    imagenBackdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600',
    trailerYoutubeId: 'dQw4w9WgXcQ',
    duracionMinutos: 155,
    calificacionCritica: 5.0,
    esExclusivoVip: false,
    proximamente: false,
    esPreventa: false,
    fechaEstreno: null,
    estadoCartelera: 'En Cartelera',
    precioBase: 180,
    generos: 'Biografía, Drama',
  },
  {
    idPelicula: 2,
    titulo: 'Cyber Protocol',
    director: 'Varios',
    sinopsis: 'Un hacker de elite descubre un protocolo secreto.',
    imagenPoster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
    imagenBackdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600',
    trailerYoutubeId: 'dQw4w9WgXcQ',
    duracionMinutos: 130,
    calificacionCritica: 4.8,
    esExclusivoVip: true,
    proximamente: true,
    esPreventa: true,
    fechaEstreno: null,
    estadoCartelera: 'Preventa',
    precioBase: 240,
    generos: 'Sci-Fi',
  },
  {
    idPelicula: 3,
    titulo: 'Trastiendas',
    director: 'Director T',
    sinopsis: 'Adentrate en el misterio liminal.',
    imagenPoster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    imagenBackdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600',
    trailerYoutubeId: 'dQw4w9WgXcQ',
    duracionMinutos: 115,
    calificacionCritica: 4.0,
    esExclusivoVip: false,
    proximamente: true,
    esPreventa: true,
    fechaEstreno: null,
    estadoCartelera: 'Preventa',
    precioBase: 180,
    generos: 'Suspenso',
  },
];

function safeValue(record, key, fallback = null) {
  return record?.[key] ?? fallback;
}

function normalizeYoutubeId(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const watchMatch = text.match(/[?&]v=([^&]+)/i);
  const shortMatch = text.match(/youtu\.be\/([^?&/]+)/i);
  const embedMatch = text.match(/youtube\.com\/embed\/([^?&/]+)/i);
  const id = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1] || text;
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

function mapMovie(record) {
  const proximamente = Boolean(record?.proximamente);
  return {
    idPelicula: record.idPelicula,
    titulo: record.titulo,
    director: record.director ?? null,
    sinopsis: record.sinopsis ?? null,
    imagenPoster: record.imagenPoster ?? null,
    imagenBackdrop: record.imagenBackdrop ?? record.imagenPoster ?? null,
    trailerYoutubeId: normalizeYoutubeId(record.trailerYoutubeId),
    duracionMinutos: record.duracionMinutos ?? 0,
    calificacionCritica: record.calificacionCritica ?? 0,
    esExclusivoVip: Boolean(record.esExclusivoVip),
    proximamente,
    esPreventa: Boolean(record.esPreventa ?? proximamente),
    fechaEstreno: record.fechaEstreno ?? null,
    estadoCartelera: record.estadoCartelera ?? (proximamente ? 'Preventa' : 'En Cartelera'),
    precioBase: record.precioBase ?? 0,
    generos: record.generos ?? '',
  };
}

function mapPromotion(record) {
  const nombre = safeValue(record, 'nombre');
  const descripcion = safeValue(record, 'descripcion', '');
  const categoriaExistente = safeValue(record, 'categoria');
  const categoriaDetectada = /dulcer|combo|popcorn|nachos|bebid|hot dog/i.test(`${nombre} ${descripcion}`)
    ? 'DULCERÍA'
    : 'TAQUILLA';
  const categoria = categoriaExistente || categoriaDetectada;

  return {
    idPromocion: record.idPromocion,
    nombre,
    descripcion,
    porcentajeDescuento: record.porcentajeDescuento,
    fechaInicio: record.fechaInicio,
    fechaFin: record.fechaFin,
    categoria,
    precioEtiqueta: record.precioEtiqueta || `${Number(record.porcentajeDescuento || 0)}%`,
    imagenUrl: record.imagenUrl || record.imagenPromo || null,
    validoHoy: Boolean(record.validoHoy ?? false),
  };
}

function mapComboRecord(record, tipo) {
  return {
    id: String(record.idReferencia),
    idReferencia: record.idReferencia,
    tipo,
    codigoTipo: record.codigoTipo,
    nombre: record.nombre,
    descripcion: record.descripcion,
    precio: Number(record.precio || 0),
    imagenUrl: record.imagenUrl || null,
    categoria: record.categoria || (tipo === 'combo' ? 'Combos' : 'Snacks'),
  };
}

function normalizeGenreName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function inferTicketPrice(tipoSala = '') {
  return DEFAULT_TICKET_PRICES[String(tipoSala).toUpperCase()] || DEFAULT_TICKET_PRICES.REGULAR;
}

function logCatalogError(scope, error) {
  console.error(`[catalog:${scope}]`, error?.message || error);
}

export const catalogService = {
  async getMovies() {
    try {
      const result = await queryDatabase(`
        SELECT
          p.IdPelicula AS idPelicula,
          p.Titulo AS titulo,
          p.Director AS director,
          p.Sinopsis AS sinopsis,
          p.ImagenPoster AS imagenPoster,
          p.ImagenBackdrop AS imagenBackdrop,
          p.TrailerYouTubeId AS trailerYoutubeId,
          p.DuracionMinutos AS duracionMinutos,
          p.CalificacionCritica AS calificacionCritica,
          p.EsExclusivoVip AS esExclusivoVip,
          p.Proximamente AS proximamente,
          ISNULL(gen.generos, '') AS generos
        FROM Peliculas p
        OUTER APPLY (
          SELECT STRING_AGG(g.NombreGenero, ', ') AS generos
          FROM Peliculas_Generos pg
          INNER JOIN Generos g ON g.IdGenero = pg.IdGenero
          WHERE pg.IdPelicula = p.IdPelicula
        ) gen
        ORDER BY p.Proximamente ASC, p.Titulo ASC
      `);
      const records = result.recordset?.map(mapMovie) || [];
      return records.length ? records : CATALOG_FALLBACK;
    } catch (error) {
      logCatalogError('movies', error);
      return CATALOG_FALLBACK;
    }
  },

  async getMovieById(idPelicula) {
    try {
      const result = await queryDatabase(
        `
          SELECT
            p.IdPelicula AS idPelicula,
            p.Titulo AS titulo,
            p.Director AS director,
            p.Sinopsis AS sinopsis,
            p.ImagenPoster AS imagenPoster,
            p.ImagenBackdrop AS imagenBackdrop,
            p.TrailerYouTubeId AS trailerYoutubeId,
            p.DuracionMinutos AS duracionMinutos,
            p.CalificacionCritica AS calificacionCritica,
            p.EsExclusivoVip AS esExclusivoVip,
            p.Proximamente AS proximamente,
            ISNULL(gen.generos, '') AS generos
          FROM Peliculas p
          OUTER APPLY (
            SELECT STRING_AGG(g.NombreGenero, ', ') AS generos
            FROM Peliculas_Generos pg
            INNER JOIN Generos g ON g.IdGenero = pg.IdGenero
            WHERE pg.IdPelicula = p.IdPelicula
          ) gen
          WHERE p.IdPelicula = @IdPelicula
        `,
        {
          IdPelicula: { type: 'int', value: Number(idPelicula) },
        },
      );
      const movie = result.recordset?.[0] ? mapMovie(result.recordset[0]) : CATALOG_FALLBACK.find((item) => item.idPelicula === Number(idPelicula));
      return movie || null;
    } catch (error) {
      logCatalogError('movieById', error);
      return CATALOG_FALLBACK.find((item) => item.idPelicula === Number(idPelicula)) || null;
    }
  },

  async getActiveShowtimes() {
    try {
      const result = await queryDatabase(`
        SELECT
          f.IdFuncion AS idFuncion,
          p.IdPelicula AS idPelicula,
          p.Titulo AS pelicula,
          p.ImagenPoster AS imagenPoster,
          p.ImagenBackdrop AS imagenBackdrop,
          p.TrailerYouTubeId AS trailerYoutubeId,
          p.DuracionMinutos AS duracionMinutos,
          f.Idioma AS idioma,
          ISNULL(gen.genero, '') AS genero,
          f.Fecha AS fecha,
          f.Hora AS hora,
          f.FormatoBadge AS formato,
          s.IdSala AS idSala,
          s.NumeroSala AS sala,
          s.TipoSala AS tipoSala,
          c.IdCine AS idCine,
          c.NombreCine AS cine,
          d.NombreDepartamento AS departamento
        FROM Funciones f
        INNER JOIN Peliculas p ON f.IdPelicula = p.IdPelicula
        INNER JOIN Salas s ON f.IdSala = s.IdSala
        INNER JOIN Cines c ON s.IdCine = c.IdCine
        INNER JOIN Departamentos d ON c.IdDepartamento = d.IdDepartamento
        OUTER APPLY (
          SELECT STRING_AGG(g.NombreGenero, ', ') AS genero
          FROM Peliculas_Generos pg
          INNER JOIN Generos g ON pg.IdGenero = g.IdGenero
          WHERE pg.IdPelicula = p.IdPelicula
        ) gen
        WHERE p.Proximamente = 0 AND f.Fecha >= CAST(GETDATE() AS DATE)
        GROUP BY
          f.IdFuncion, p.IdPelicula, p.Titulo, p.ImagenPoster, p.ImagenBackdrop,
          p.TrailerYouTubeId, p.DuracionMinutos,
          f.Idioma, gen.genero, f.Fecha, f.Hora, f.FormatoBadge, s.IdSala,
          s.NumeroSala, s.TipoSala, c.IdCine, c.NombreCine, d.NombreDepartamento
        ORDER BY f.Fecha ASC, f.Hora ASC
      `);
      return (result.recordset || []).map((item) => ({
        ...item,
        precioBoleto: inferTicketPrice(item.tipoSala),
      }));
    } catch (error) {
      logCatalogError('showtimes', error);
      return [];
    }
  },

  async getShowtimesByMovie(idPelicula) {
    const showtimes = await this.getActiveShowtimes();
    return showtimes.filter((item) => Number(item.idPelicula) === Number(idPelicula));
  },

  async getPromotions() {
    try {
      const result = await queryDatabase(`
        SELECT
          IdPromocion AS idPromocion,
          NombrePromocion AS nombre,
          Descripcion AS descripcion,
          PorcentajeDescuento AS porcentajeDescuento,
          FechaInicio AS fechaInicio,
          FechaFin AS fechaFin,
          TipoPromocion AS categoria,
          CONCAT(CAST(PorcentajeDescuento AS varchar(10)), '%') AS precioEtiqueta,
          ImagenPromo AS imagenUrl,
          CASE WHEN GETDATE() BETWEEN FechaInicio AND FechaFin THEN 1 ELSE 0 END AS validoHoy
        FROM Promocion
        WHERE FechaFin >= CAST(GETDATE() AS DATE)
        ORDER BY FechaInicio DESC
      `);
      return (result.recordset || []).map(mapPromotion);
    } catch (error) {
      logCatalogError('promotions', error);
      return [];
    }
  },

  async getMemberships() {
    try {
      const result = await queryDatabase(`
        SELECT
          IdTipoCliente AS idTipoCliente,
          NombreTipo AS nombreTipo,
          PrecioMensual AS precioMensual,
          PorcentajeDescuentoBase AS porcentajeDescuentoBase,
          DescripcionExperiencia AS descripcionExperiencia,
          EsRecomendado AS esRecomendado
        FROM TipoCliente
        ORDER BY PrecioMensual ASC
      `);
      return result.recordset || [];
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },

  async getGenres() {
    try {
      const result = await queryDatabase(`
        SELECT DISTINCT
          NombreGenero AS nombreGenero
        FROM Generos
        ORDER BY NombreGenero ASC
      `);
      return (result.recordset || [])
        .map((item) => String(item.nombreGenero || '').trim())
        .filter(Boolean);
    } catch (error) {
      logCatalogError('genres', error);
      return [];
    }
  },

  async getCombos() {
    try {
      const result = await queryDatabase(`
        SELECT
          CAST(IdCombo AS VARCHAR(20)) AS id,
          IdCombo AS idReferencia,
          'combo' AS tipo,
          CodigoTipo AS codigoTipo,
          NombreCombo AS nombre,
          Descripcion AS descripcion,
          PrecioFijo AS precio,
          ImagenCombo AS imagenUrl,
          'Combos' AS categoria
        FROM Combo
        WHERE Estado = 1
        UNION ALL
        SELECT
          CAST(IdProducto AS VARCHAR(20)) AS id,
          IdProducto AS idReferencia,
          'producto' AS tipo,
          CodigoTipo AS codigoTipo,
          NombreProducto AS nombre,
          Descripcion AS descripcion,
          PrecioActual AS precio,
          ImagenProducto AS imagenUrl,
          CASE
            WHEN CodigoTipo LIKE '%beb%' THEN 'Bebidas'
            WHEN CodigoTipo LIKE '%snack%' THEN 'Snacks'
            ELSE 'Snacks'
          END AS categoria
        FROM Producto
        ORDER BY categoria ASC, nombre ASC
      `);
      return (result.recordset || []).map((item) => mapComboRecord(item, item.tipo));
    } catch (error) {
      logCatalogError('combos', error);
      return [];
    }
  },

  async getInformationSections() {
    try {
      const result = await queryDatabase(`
        SELECT
          IdFaq AS idInformacion,
          PreguntaTitulo AS titulo,
          RespuestaCuerpo AS descripcion,
          'FAQ' AS etiqueta
        FROM Preguntas_Frecuentes
        ORDER BY IdFaq ASC
      `);
      return result.recordset?.length ? result.recordset : INFORMATION_FALLBACK;
    } catch (error) {
      return INFORMATION_FALLBACK;
    }
  },

  async getSeatsByFunction(idFuncion) {
    try {
      const result = await queryDatabase(
        `
          SELECT
            a.IdAsiento AS idAsiento,
            a.Fila AS fila,
            a.Numero AS numero,
            CASE WHEN b.IdBoleto IS NULL THEN 'disponible' ELSE 'ocupado' END AS estado
          FROM Funciones f
          INNER JOIN Asientos a ON a.IdSala = f.IdSala
          LEFT JOIN Boletos b ON b.IdFuncion = f.IdFuncion AND b.IdAsiento = a.IdAsiento
          WHERE f.IdFuncion = @IdFuncion
          ORDER BY a.Fila ASC, a.Numero ASC
        `,
        {
          IdFuncion: { type: 'int', value: Number(idFuncion) },
        },
      );
      return result.recordset || [];
    } catch (error) {
      return [];
    }
  },

  async getFeaturedMovies(limit = 3) {
    const movies = await this.getMovies();
    return movies
      .slice()
      .filter((movie) => String(movie.trailerYoutubeId || '').trim().length > 0)
      .sort((a, b) => Number(b.esExclusivoVip) - Number(a.esExclusivoVip) || Number(b.proximamente) - Number(a.proximamente))
      .slice(0, limit);
  },

  async getCarteleraOverview() {
    const movies = await this.getMovies();
    const showtimes = await this.getActiveShowtimes();

    const fechasDisponibles = Array.from(
      new Set(showtimes.map((showtime) => String(showtime.fecha).slice(0, 10)).filter(Boolean)),
    ).map((fecha) => ({
      fecha,
      day: new Date(`${fecha}T00:00:00`).toLocaleDateString('es-NI', { weekday: 'short' }),
      date: new Date(`${fecha}T00:00:00`).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' }),
    }));

    return {
      peliculas: movies,
      fechasDisponibles,
      funciones: showtimes,
    };
  },
};
