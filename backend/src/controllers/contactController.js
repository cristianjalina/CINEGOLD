import { asyncHandler } from '../utils/asyncHandler.js';
import { contactService } from '../services/contactService.js';

export const contactController = {
  create: asyncHandler(async (req, res) => {
    const result = await contactService.create(req.validated.body);
    res.status(201).json(result);
  }),
};
