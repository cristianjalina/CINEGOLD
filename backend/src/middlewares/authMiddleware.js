import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  if (!token) {
    return next(new ApiError(401, 'Token JWT requerido.'));
  }

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    next(new ApiError(401, 'Token JWT inválido o expirado.'));
  }
}

export function requireRole(roles = []) {
  return (req, _res, next) => {
    const userRoles = req.auth?.roles || [];
    const allowed = roles.some((role) => userRoles.includes(role));

    if (!allowed) {
      return next(new ApiError(403, 'No tienes permisos para acceder a este recurso.'));
    }

    next();
  };
}
