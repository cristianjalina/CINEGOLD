import { ApiError } from './ApiError.js';

export function mapDatabaseError(error) {
  const message = error?.message || 'Error de base de datos.';

  if (message.includes('Could not find stored procedure')) {
    return new ApiError(501, 'Falta un procedimiento almacenado requerido por la arquitectura.', {
      databaseMessage: message,
    });
  }

  if (message.includes('ya ha sido reservado')) {
    return new ApiError(409, message);
  }

  if (message.includes('credenciales únicas duplicadas')) {
    return new ApiError(409, message);
  }

  return new ApiError(500, message);
}
