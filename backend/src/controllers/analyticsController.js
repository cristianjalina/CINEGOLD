import { asyncHandler } from '../utils/asyncHandler.js';
import { analyticsService } from '../services/analyticsService.js';

export const analyticsController = {
  monthlySales: asyncHandler(async (_req, res) => {
    const metrics = await analyticsService.getMonthlySalesMetrics();
    res.json({ data: metrics });
  }),

  metrics: asyncHandler(async (_req, res) => {
    const metrics = await analyticsService.getMonthlySalesMetrics();
    const totalIngresos = metrics.reduce((sum, row) => sum + Number(row.TotalRecaudado || 0), 0);
    const totalTransacciones = metrics.reduce((sum, row) => sum + Number(row.TransaccionesTotales || 0), 0);

    res.json({
      data: {
        metrics,
        resumen: {
          totalIngresos,
          totalTransacciones,
        },
      },
    });
  }),
};
