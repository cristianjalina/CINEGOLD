import { queryDatabase } from '../db/request.js';
import { mapDatabaseError } from '../utils/dbErrors.js';

export const reservationService = {
  async history(auth) {
    try {
      const result = await queryDatabase(
        `
          SELECT TOP 50
            f.IdFactura AS idFactura,
            f.CodigoReservaWeb AS codigoReservaWeb,
            f.FechaEmision AS fechaEmision,
            f.Total AS total,
            p.Titulo AS pelicula,
            fn.Fecha AS fechaFuncion,
            fn.Hora AS horaFuncion,
            s.NumeroSala AS sala,
            s.TipoSala AS tipoSala
          FROM Factura f
          LEFT JOIN Boletos b ON b.IdFactura = f.IdFactura
          LEFT JOIN Funciones fn ON fn.IdFuncion = b.IdFuncion
          LEFT JOIN Peliculas p ON p.IdPelicula = fn.IdPelicula
          LEFT JOIN Salas s ON s.IdSala = fn.IdSala
          WHERE (@TipoCuenta = 'Cliente' AND f.IdCliente = @Id)
             OR (@TipoCuenta <> 'Cliente' AND f.IdUsuario = @Id)
          ORDER BY f.FechaEmision DESC
        `,
        {
          TipoCuenta: { type: 'varchar', length: 20, value: auth.tipoCuenta || '' },
          Id: { type: 'int', value: auth.id },
        },
      );
      return result.recordset || [];
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },
};
