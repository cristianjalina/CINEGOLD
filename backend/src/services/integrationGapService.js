import { ApiError } from '../utils/ApiError.js';

export function missingStoredProcedure(name) {
  throw new ApiError(501, `El procedimiento almacenado ${name} no está definido en CinegolDB.sql.`, {
    requiredAction: 'Definir el procedimiento en SQL Server o actualizar el contrato de base de datos.',
  });
}
