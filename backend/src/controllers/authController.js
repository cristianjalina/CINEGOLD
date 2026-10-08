import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { authService } from '../services/authService.js';

export const authController = {
  registerClient: asyncHandler(async (req, res) => {
    const result = await authService.registerClient(req.validated.body);
    res.status(201).json(result);
  }),

  activateCinegoldPlus: asyncHandler(async (req, res) => {
    const result = await authService.activateCinegoldPlus(req.validated.body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.validated.body);

    if (!result) {
      throw new ApiError(401, 'Credenciales inválidas.');
    }

    res.json(result);
  }),
};
