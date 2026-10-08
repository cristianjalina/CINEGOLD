import { asyncHandler } from '../utils/asyncHandler.js';
import { checkoutService } from '../services/checkoutService.js';

export const checkoutController = {
  processTicketPurchase: asyncHandler(async (req, res) => {
    const result = await checkoutService.processTicketPurchase(req.validated.body);
    res.status(201).json(result);
  }),
};
