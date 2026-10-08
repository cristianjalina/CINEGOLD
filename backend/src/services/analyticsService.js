import { queryDatabase } from '../db/request.js';
import { mapDatabaseError } from '../utils/dbErrors.js';

export const analyticsService = {
  async getMonthlySalesMetrics() {
    try {
      const result = await queryDatabase(`
        SELECT
          c.NombreCine AS NombreCine,
          YEAR(f.FechaEmision) AS Anio,
          MONTH(f.FechaEmision) AS Mes,
          SUM(f.Total) AS TotalRecaudado,
          COUNT(DISTINCT f.IdFactura) AS TransaccionesTotales,
          COUNT(b.IdBoleto) AS TotalBoletos
        FROM Factura f
        INNER JOIN Cines c ON c.IdCine = f.IdCine
        LEFT JOIN Boletos b ON b.IdFactura = f.IdFactura
        GROUP BY c.NombreCine, YEAR(f.FechaEmision), MONTH(f.FechaEmision)
        ORDER BY Anio ASC, Mes ASC
      `);
      return result.recordset || [];
    } catch (error) {
      return [];
    }
  },
};
