import { queryDatabase } from '../db/request.js';
import { mapDatabaseError } from '../utils/dbErrors.js';

function wrapInsertId(recordset, key) {
  return recordset?.[0]?.[key] ?? null;
}

function normalizePromoTargets(targets = []) {
  return Array.isArray(targets)
    ? targets
        .map((item) => ({
          tipo: item.tipo,
          id: Number(item.id),
        }))
        .filter((item) => ['Pelicula', 'Producto', 'Combo'].includes(item.tipo) && Number.isInteger(item.id) && item.id > 0)
    : [];
}

function normalizeGenres(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSqlDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : text;
}

function normalizeSqlTime(value) {
  if (!value) return null;

  const buildTimeDate = (hour, minute = 0, second = 0) => new Date(Date.UTC(1970, 0, 1, hour, minute, second, 0));

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return buildTimeDate(value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds());
  }

  const text = String(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.]/g, '')
    .trim();

  const explicit = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (explicit) {
    return buildTimeDate(Number(explicit[1]), Number(explicit[2]), Number(explicit[3] || 0));
  }

  const meridiem = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|a m|p m)$/);
  if (meridiem) {
    let hour = Number(meridiem[1]) % 12;
    if (meridiem[4].startsWith('p')) hour += 12;
    return buildTimeDate(hour, Number(meridiem[2]), Number(meridiem[3] || 0));
  }

  const timeOnly = text.match(/^(\d{1,2})\s*(am|pm|a m|p m)$/);
  if (timeOnly) {
    let hour = Number(timeOnly[1]) % 12;
    if (timeOnly[2].startsWith('p')) hour += 12;
    return buildTimeDate(hour, 0, 0);
  }

  const fallback = Number(text);
  if (Number.isFinite(fallback) && fallback >= 0 && fallback <= 23) {
    return buildTimeDate(Math.trunc(fallback), 0, 0);
  }

  return null;
}

async function syncMovieGenres(idPelicula, generos = '') {
  const genres = normalizeGenres(generos);
  await queryDatabase('DELETE FROM Peliculas_Generos WHERE IdPelicula = @IdPelicula', {
    IdPelicula: { type: 'int', value: Number(idPelicula) },
  });

  for (const nombreGenero of genres) {
    const existing = await queryDatabase('SELECT TOP 1 IdGenero FROM Generos WHERE NombreGenero = @NombreGenero', {
      NombreGenero: { type: 'varchar', length: 100, value: nombreGenero },
    });
    let idGenero = existing.recordset?.[0]?.IdGenero;
    if (!idGenero) {
      const created = await queryDatabase(
        'INSERT INTO Generos (NombreGenero) OUTPUT INSERTED.IdGenero AS IdGenero VALUES (@NombreGenero)',
        { NombreGenero: { type: 'varchar', length: 100, value: nombreGenero } },
      );
      idGenero = created.recordset?.[0]?.IdGenero;
    }
    if (idGenero) {
      await queryDatabase(
        'INSERT INTO Peliculas_Generos (IdPelicula, IdGenero) VALUES (@IdPelicula, @IdGenero)',
        {
          IdPelicula: { type: 'int', value: Number(idPelicula) },
          IdGenero: { type: 'int', value: Number(idGenero) },
        },
      );
    }
  }
}

async function replacePromotionTargets(idPromocion, targets = []) {
  await queryDatabase(`DELETE FROM PromocionDetalle WHERE IdPromocion = @IdPromocion`, {
    IdPromocion: { type: 'int', value: Number(idPromocion) },
  });

  for (const target of normalizePromoTargets(targets)) {
    await queryDatabase(
      `
        INSERT INTO PromocionDetalle (IdPromocion, TipoObjetivo, IdReferencia)
        VALUES (@IdPromocion, @TipoObjetivo, @IdReferencia)
      `,
      {
        IdPromocion: { type: 'int', value: Number(idPromocion) },
        TipoObjetivo: { type: 'varchar', length: 20, value: target.tipo },
        IdReferencia: { type: 'int', value: target.id },
      },
    );
  }
}

export const adminService = {
  // Peliculas
  async listMovies() {
    const result = await queryDatabase(`
      SELECT
        p.IdPelicula AS idPelicula,
        p.Titulo AS titulo,
        p.Director AS director,
        p.Sinopsis AS sinopsis,
        p.ImagenPoster AS imagenPoster,
        p.DuracionMinutos AS duracionMinutos,
        p.CalificacionCritica AS calificacionCritica,
        p.EsExclusivoVip AS esExclusivoVip,
        p.Proximamente AS proximamente,
        p.TrailerYouTubeId AS trailerYoutubeId,
        p.ImagenBackdrop AS imagenBackdrop,
        STRING_AGG(g.NombreGenero, ', ') AS generos
      FROM Peliculas p
      LEFT JOIN Peliculas_Generos pg ON pg.IdPelicula = p.IdPelicula
      LEFT JOIN Generos g ON g.IdGenero = pg.IdGenero
      GROUP BY
        p.IdPelicula, p.Titulo, p.Director, p.Sinopsis, p.ImagenPoster, p.DuracionMinutos,
        p.CalificacionCritica, p.EsExclusivoVip, p.Proximamente, p.TrailerYouTubeId, p.ImagenBackdrop
      ORDER BY p.IdPelicula DESC
    `);
    return result.recordset || [];
  },

  async listRooms() {
    const result = await queryDatabase(`
      SELECT
        s.IdSala AS idSala,
        s.NumeroSala AS numeroSala,
        s.TipoSala AS tipoSala,
        c.NombreCine AS nombreCine
      FROM Salas s
      LEFT JOIN Cines c ON c.IdCine = s.IdCine
      ORDER BY s.IdSala DESC
    `);
    return result.recordset || [];
  },

  async createMovie(payload) {
    try {
      const result = await queryDatabase(
        `
          INSERT INTO Peliculas
            (Titulo, Director, Sinopsis, ImagenPoster, DuracionMinutos, CalificacionCritica, EsExclusivoVip, Proximamente, TrailerYouTubeId, ImagenBackdrop)
          OUTPUT INSERTED.IdPelicula AS idPelicula
          VALUES
            (@Titulo, @Director, @Sinopsis, @ImagenPoster, @DuracionMinutos, @CalificacionCritica, @EsExclusivoVip, @Proximamente, @TrailerYouTubeId, @ImagenBackdrop)
        `,
        {
          Titulo: { type: 'varchar', length: 150, value: payload.titulo },
          Director: { type: 'varchar', length: 100, value: payload.director },
          Generos: { type: 'varchar', length: 255, value: payload.generos || '' },
          Sinopsis: { type: 'varchar', value: payload.sinopsis },
          ImagenPoster: { type: 'varchar', length: 255, value: payload.imagenPoster || '' },
          DuracionMinutos: { type: 'int', value: payload.duracionMinutos },
          CalificacionCritica: { type: 'decimal', precision: 2, scale: 1, value: payload.calificacionCritica },
          EsExclusivoVip: { type: 'bit', value: payload.esExclusivoVip ? 1 : 0 },
          Proximamente: { type: 'bit', value: payload.proximamente ? 1 : 0 },
          TrailerYouTubeId: { type: 'varchar', length: 50, value: payload.trailerYoutubeId },
          ImagenBackdrop: { type: 'varchar', length: 255, value: payload.imagenBackdrop },
        },
      );
      const idPelicula = wrapInsertId(result.recordset, 'idPelicula');
      await syncMovieGenres(idPelicula, payload.generos);
      return { idPelicula };
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },

  async updateMovie(idPelicula, payload) {
    try {
      await queryDatabase(
        `
          UPDATE Peliculas
          SET Titulo = @Titulo,
              Director = @Director,
              Sinopsis = @Sinopsis,
              ImagenPoster = @ImagenPoster,
              DuracionMinutos = @DuracionMinutos,
              CalificacionCritica = @CalificacionCritica,
              EsExclusivoVip = @EsExclusivoVip,
              Proximamente = @Proximamente,
              TrailerYouTubeId = @TrailerYouTubeId,
              ImagenBackdrop = @ImagenBackdrop
          WHERE IdPelicula = @IdPelicula
        `,
        {
          IdPelicula: { type: 'int', value: Number(idPelicula) },
          Titulo: { type: 'varchar', length: 150, value: payload.titulo },
          Director: { type: 'varchar', length: 100, value: payload.director },
          Generos: { type: 'varchar', length: 255, value: payload.generos || '' },
          Sinopsis: { type: 'varchar', value: payload.sinopsis },
          ImagenPoster: { type: 'varchar', length: 255, value: payload.imagenPoster || '' },
          DuracionMinutos: { type: 'int', value: payload.duracionMinutos },
          CalificacionCritica: { type: 'decimal', precision: 2, scale: 1, value: payload.calificacionCritica },
          EsExclusivoVip: { type: 'bit', value: payload.esExclusivoVip ? 1 : 0 },
          Proximamente: { type: 'bit', value: payload.proximamente ? 1 : 0 },
          TrailerYouTubeId: { type: 'varchar', length: 50, value: payload.trailerYoutubeId },
          ImagenBackdrop: { type: 'varchar', length: 255, value: payload.imagenBackdrop },
        },
      );
      await syncMovieGenres(idPelicula, payload.generos);
      return { idPelicula: Number(idPelicula) };
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },

  async deleteMovie(idPelicula) {
    await queryDatabase(
      `DELETE FROM Peliculas WHERE IdPelicula = @IdPelicula`,
      { IdPelicula: { type: 'int', value: Number(idPelicula) } },
    );
    return { idPelicula: Number(idPelicula) };
  },

  // Producto
  async listProducts() {
    const result = await queryDatabase(`
      SELECT
        IdProducto AS idProducto,
        CodigoTipo AS codigoTipo,
        NombreProducto AS nombreProducto,
        Descripcion AS descripcion,
        PrecioActual AS precioActual,
        Stock AS stock,
        Categoria AS categoria,
        ImagenProducto AS imagenProducto
      FROM Producto
      ORDER BY IdProducto DESC
    `);
    return result.recordset || [];
  },

  async createProduct(payload) {
    const result = await queryDatabase(
      `
        INSERT INTO Producto (CodigoTipo, NombreProducto, Descripcion, PrecioActual, Stock, Categoria, ImagenProducto)
        OUTPUT INSERTED.IdProducto AS idProducto
        VALUES (@CodigoTipo, @NombreProducto, @Descripcion, @PrecioActual, @Stock, @Categoria, @ImagenProducto)
      `,
      {
        CodigoTipo: { type: 'varchar', length: 50, value: payload.codigoTipo },
        NombreProducto: { type: 'varchar', length: 100, value: payload.nombreProducto },
        Descripcion: { type: 'varchar', length: 255, value: payload.descripcion },
        PrecioActual: { type: 'decimal', precision: 10, scale: 2, value: payload.precioActual },
        Stock: { type: 'int', value: payload.stock },
        Categoria: { type: 'varchar', length: 50, value: payload.categoria },
        ImagenProducto: { type: 'varchar', length: 255, value: payload.imagenProducto },
      },
    );
    return { idProducto: wrapInsertId(result.recordset, 'idProducto') };
  },

  async updateProduct(idProducto, payload) {
    await queryDatabase(
      `
        UPDATE Producto
        SET CodigoTipo = @CodigoTipo,
            NombreProducto = @NombreProducto,
            Descripcion = @Descripcion,
            PrecioActual = @PrecioActual,
            Stock = @Stock,
            Categoria = @Categoria,
            ImagenProducto = @ImagenProducto
        WHERE IdProducto = @IdProducto
      `,
      {
        IdProducto: { type: 'int', value: Number(idProducto) },
        CodigoTipo: { type: 'varchar', length: 50, value: payload.codigoTipo },
        NombreProducto: { type: 'varchar', length: 100, value: payload.nombreProducto },
        Descripcion: { type: 'varchar', length: 255, value: payload.descripcion },
        PrecioActual: { type: 'decimal', precision: 10, scale: 2, value: payload.precioActual },
        Stock: { type: 'int', value: payload.stock },
        Categoria: { type: 'varchar', length: 50, value: payload.categoria },
        ImagenProducto: { type: 'varchar', length: 255, value: payload.imagenProducto },
      },
    );
    return { idProducto: Number(idProducto) };
  },

  async deleteProduct(idProducto) {
    await queryDatabase(`DELETE FROM Producto WHERE IdProducto = @IdProducto`, {
      IdProducto: { type: 'int', value: Number(idProducto) },
    });
    return { idProducto: Number(idProducto) };
  },

  // Combo
  async listCombos() {
    const result = await queryDatabase(`
      SELECT
        IdCombo AS idCombo,
        CodigoTipo AS codigoTipo,
        NombreCombo AS nombreCombo,
        Descripcion AS descripcion,
        PrecioFijo AS precioFijo,
        Estado AS estado,
        Categoria AS categoria,
        ImagenCombo AS imagenCombo
      FROM Combo
      ORDER BY IdCombo DESC
    `);
    return result.recordset || [];
  },

  async createCombo(payload) {
    const result = await queryDatabase(
      `
        INSERT INTO Combo (CodigoTipo, NombreCombo, Descripcion, PrecioFijo, Estado, Categoria, ImagenCombo)
        OUTPUT INSERTED.IdCombo AS idCombo
        VALUES (@CodigoTipo, @NombreCombo, @Descripcion, @PrecioFijo, @Estado, @Categoria, @ImagenCombo)
      `,
      {
        CodigoTipo: { type: 'varchar', length: 50, value: payload.codigoTipo },
        NombreCombo: { type: 'varchar', length: 100, value: payload.nombreCombo },
        Descripcion: { type: 'varchar', length: 255, value: payload.descripcion },
        PrecioFijo: { type: 'decimal', precision: 10, scale: 2, value: payload.precioFijo },
        Estado: { type: 'bit', value: payload.estado ? 1 : 0 },
        Categoria: { type: 'varchar', length: 50, value: payload.categoria },
        ImagenCombo: { type: 'varchar', length: 255, value: payload.imagenCombo },
      },
    );
    return { idCombo: wrapInsertId(result.recordset, 'idCombo') };
  },

  async updateCombo(idCombo, payload) {
    await queryDatabase(
      `
        UPDATE Combo
        SET CodigoTipo = @CodigoTipo,
            NombreCombo = @NombreCombo,
            Descripcion = @Descripcion,
            PrecioFijo = @PrecioFijo,
            Estado = @Estado,
            Categoria = @Categoria,
            ImagenCombo = @ImagenCombo
        WHERE IdCombo = @IdCombo
      `,
      {
        IdCombo: { type: 'int', value: Number(idCombo) },
        CodigoTipo: { type: 'varchar', length: 50, value: payload.codigoTipo },
        NombreCombo: { type: 'varchar', length: 100, value: payload.nombreCombo },
        Descripcion: { type: 'varchar', length: 255, value: payload.descripcion },
        PrecioFijo: { type: 'decimal', precision: 10, scale: 2, value: payload.precioFijo },
        Estado: { type: 'bit', value: payload.estado ? 1 : 0 },
        Categoria: { type: 'varchar', length: 50, value: payload.categoria },
        ImagenCombo: { type: 'varchar', length: 255, value: payload.imagenCombo },
      },
    );
    return { idCombo: Number(idCombo) };
  },

  async deleteCombo(idCombo) {
    await queryDatabase(`DELETE FROM Combo WHERE IdCombo = @IdCombo`, {
      IdCombo: { type: 'int', value: Number(idCombo) },
    });
    return { idCombo: Number(idCombo) };
  },

  // Promocion
  async listPromotions() {
    const result = await queryDatabase(`
      SELECT
        p.IdPromocion AS idPromocion,
        p.NombrePromocion AS nombrePromocion,
        p.Descripcion AS descripcion,
        p.PorcentajeDescuento AS porcentajeDescuento,
        p.FechaInicio AS fechaInicio,
        p.FechaFin AS fechaFin,
        p.TipoPromocion AS tipoPromocion,
        p.ImagenPromo AS imagenPromo,
        p.ValidezTexto AS validezTexto,
        STRING_AGG(CONCAT(pd.TipoObjetivo, ':', pd.IdReferencia), ',') AS targetsRaw
      FROM Promocion p
      LEFT JOIN PromocionDetalle pd ON pd.IdPromocion = p.IdPromocion
      GROUP BY
        p.IdPromocion,
        p.NombrePromocion,
        p.Descripcion,
        p.PorcentajeDescuento,
        p.FechaInicio,
        p.FechaFin,
        p.TipoPromocion,
        p.ImagenPromo,
        p.ValidezTexto
      ORDER BY IdPromocion DESC
    `);
    return (result.recordset || []).map((item) => ({
      ...item,
      targets: String(item.targetsRaw || '')
        .split(',')
        .filter(Boolean)
        .map((pair) => {
          const [tipo, id] = pair.split(':');
          return { tipo, id: Number(id) };
        }),
    }));
  },

  async createPromotion(payload) {
    const result = await queryDatabase(
      `
        INSERT INTO Promocion
          (NombrePromocion, Descripcion, PorcentajeDescuento, FechaInicio, FechaFin, TipoPromocion, ImagenPromo, ValidezTexto)
        OUTPUT INSERTED.IdPromocion AS idPromocion
        VALUES
          (@NombrePromocion, @Descripcion, @PorcentajeDescuento, @FechaInicio, @FechaFin, @TipoPromocion, @ImagenPromo, @ValidezTexto)
      `,
      {
        NombrePromocion: { type: 'varchar', length: 100, value: payload.nombrePromocion },
        Descripcion: { type: 'varchar', length: 255, value: payload.descripcion },
        PorcentajeDescuento: { type: 'decimal', precision: 5, scale: 2, value: payload.porcentajeDescuento },
        FechaInicio: { type: 'datetime', value: payload.fechaInicio },
        FechaFin: { type: 'datetime', value: payload.fechaFin },
        TipoPromocion: { type: 'varchar', length: 20, value: payload.tipoPromocion },
        ImagenPromo: { type: 'varchar', length: 255, value: payload.imagenPromo },
        ValidezTexto: { type: 'varchar', length: 100, value: payload.validezTexto },
      },
    );
    await replacePromotionTargets(wrapInsertId(result.recordset, 'idPromocion'), payload.targets);
    return { idPromocion: wrapInsertId(result.recordset, 'idPromocion') };
  },

  async updatePromotion(idPromocion, payload) {
    await queryDatabase(
      `
        UPDATE Promocion
        SET NombrePromocion = @NombrePromocion,
            Descripcion = @Descripcion,
            PorcentajeDescuento = @PorcentajeDescuento,
            FechaInicio = @FechaInicio,
            FechaFin = @FechaFin,
            TipoPromocion = @TipoPromocion,
            ImagenPromo = @ImagenPromo,
            ValidezTexto = @ValidezTexto
        WHERE IdPromocion = @IdPromocion
      `,
      {
        IdPromocion: { type: 'int', value: Number(idPromocion) },
        NombrePromocion: { type: 'varchar', length: 100, value: payload.nombrePromocion },
        Descripcion: { type: 'varchar', length: 255, value: payload.descripcion },
        PorcentajeDescuento: { type: 'decimal', precision: 5, scale: 2, value: payload.porcentajeDescuento },
        FechaInicio: { type: 'datetime', value: payload.fechaInicio },
        FechaFin: { type: 'datetime', value: payload.fechaFin },
        TipoPromocion: { type: 'varchar', length: 20, value: payload.tipoPromocion },
        ImagenPromo: { type: 'varchar', length: 255, value: payload.imagenPromo },
        ValidezTexto: { type: 'varchar', length: 100, value: payload.validezTexto },
      },
    );
    await replacePromotionTargets(idPromocion, payload.targets);
    return { idPromocion: Number(idPromocion) };
  },

  async deletePromotion(idPromocion) {
    await queryDatabase(`DELETE FROM PromocionDetalle WHERE IdPromocion = @IdPromocion`, {
      IdPromocion: { type: 'int', value: Number(idPromocion) },
    });
    await queryDatabase(`DELETE FROM Promocion WHERE IdPromocion = @IdPromocion`, {
      IdPromocion: { type: 'int', value: Number(idPromocion) },
    });
    return { idPromocion: Number(idPromocion) };
  },

  // Funciones
  async listFunctions() {
    const result = await queryDatabase(`
      SELECT
        f.IdFuncion AS idFuncion,
        f.IdPelicula AS idPelicula,
        p.Titulo AS peliculaTitulo,
        f.IdSala AS idSala,
        s.NumeroSala AS numeroSala,
        s.TipoSala AS tipoSala,
        c.NombreCine AS nombreCine,
        f.Fecha AS fecha,
        f.Hora AS hora,
        f.Idioma AS idioma,
        f.FormatoBadge AS formatoBadge
      FROM Funciones f
      LEFT JOIN Peliculas p ON p.IdPelicula = f.IdPelicula
      LEFT JOIN Salas s ON s.IdSala = f.IdSala
      LEFT JOIN Cines c ON c.IdCine = s.IdCine
      ORDER BY Fecha DESC, Hora DESC
    `);
    return result.recordset || [];
  },

  async createFunction(payload) {
    const fecha = normalizeSqlDate(payload.fecha);
    const hora = normalizeSqlTime(payload.hora);
    const result = await queryDatabase(
      `
        INSERT INTO Funciones (IdPelicula, IdSala, Fecha, Hora, Idioma, FormatoBadge)
        OUTPUT INSERTED.IdFuncion AS idFuncion
        VALUES (@IdPelicula, @IdSala, @Fecha, @Hora, @Idioma, @FormatoBadge)
      `,
      {
        IdPelicula: { type: 'int', value: payload.idPelicula },
        IdSala: { type: 'int', value: payload.idSala },
        Fecha: { type: 'date', value: fecha },
        Hora: { type: 'time', value: hora },
        Idioma: { type: 'varchar', length: 50, value: payload.idioma },
        FormatoBadge: { type: 'varchar', length: 50, value: payload.formatoBadge },
      },
    );
    return { idFuncion: wrapInsertId(result.recordset, 'idFuncion') };
  },

  async updateFunction(idFuncion, payload) {
    const fecha = normalizeSqlDate(payload.fecha);
    const hora = normalizeSqlTime(payload.hora);
    await queryDatabase(
      `
        UPDATE Funciones
        SET IdPelicula = @IdPelicula,
            IdSala = @IdSala,
            Fecha = @Fecha,
            Hora = @Hora,
            Idioma = @Idioma,
            FormatoBadge = @FormatoBadge
        WHERE IdFuncion = @IdFuncion
      `,
      {
        IdFuncion: { type: 'int', value: Number(idFuncion) },
        IdPelicula: { type: 'int', value: payload.idPelicula },
        IdSala: { type: 'int', value: payload.idSala },
        Fecha: { type: 'date', value: fecha },
        Hora: { type: 'time', value: hora },
        Idioma: { type: 'varchar', length: 50, value: payload.idioma },
        FormatoBadge: { type: 'varchar', length: 50, value: payload.formatoBadge },
      },
    );
    return { idFuncion: Number(idFuncion) };
  },

  async deleteFunction(idFuncion) {
    await queryDatabase(`DELETE FROM Funciones WHERE IdFuncion = @IdFuncion`, {
      IdFuncion: { type: 'int', value: Number(idFuncion) },
    });
    return { idFuncion: Number(idFuncion) };
  },
};
