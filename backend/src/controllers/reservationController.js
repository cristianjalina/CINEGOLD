import { asyncHandler } from '../utils/asyncHandler.js';
import { reservationService } from '../services/reservationService.js';

export const reservationController = {
  history: asyncHandler(async (req, res) => {
    const reservations = await reservationService.history(req.auth);
    res.json({ data: reservations });
  }),
};
