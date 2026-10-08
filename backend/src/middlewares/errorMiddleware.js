import { ApiError } from '../utils/ApiError.js';

export function errorMiddleware(error, _req, res, _next) {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const payload = {
    message: error.message || 'Error interno del servidor.',
  };

  if (error.details) {
    payload.details = error.details;
  }

  res.status(statusCode).json(payload);
}
