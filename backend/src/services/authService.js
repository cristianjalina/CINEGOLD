import bcrypt from 'bcryptjs';
import { queryDatabase } from '../db/request.js';
import { mapDatabaseError } from '../utils/dbErrors.js';
import { signToken } from '../utils/token.js';

function normalizeRoles(record) {
  if (record.roles) {
    return String(record.roles)
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);
  }

  if (record.tipoCuenta === 'Cliente') {
    return ['Miembro'];
  }

  return ['Administrador'];
}

export const authService = {
  async registerClient(payload) {
    try {
      const passwordHash = await bcrypt.hash(payload.password, 12);
      const idTipoCliente = payload.idTipoCliente || 2;
      const result = await queryDatabase(
        `
          INSERT INTO Cliente
            (Identificacion, Nombre, Apellido, Nickname, Correo, Telefono, PasswordHash, IdTipoCliente)
          OUTPUT INSERTED.IdCliente AS idCliente
          VALUES
            (@Identificacion, @Nombre, @Apellido, @Nickname, @Correo, @Telefono, @PasswordHash, @IdTipoCliente)
        `,
        {
          Identificacion: { type: 'varchar', length: 50, value: payload.identificacion },
          Nombre: { type: 'varchar', length: 100, value: payload.nombre },
          Apellido: { type: 'varchar', length: 100, value: payload.apellido },
          Nickname: { type: 'varchar', length: 150, value: payload.nickname },
          Correo: { type: 'varchar', length: 100, value: payload.correo },
          Telefono: { type: 'varchar', length: 20, value: payload.telefono },
          PasswordHash: { type: 'varchar', length: 256, value: passwordHash },
          IdTipoCliente: { type: 'int', value: idTipoCliente },
        },
      );

      return {
        idCliente: result.recordset?.[0]?.idCliente,
      };
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },

  async activateCinegoldPlus(payload) {
    try {
      const passwordHash = await bcrypt.hash(payload.codigo, 12);
      const existing = await queryDatabase(
        `
          SELECT TOP 1
            IdCliente AS idCliente,
            Nombre,
            Apellido,
            Correo,
            IdTipoCliente
          FROM Cliente
          WHERE Correo = @Correo
        `,
        {
          Correo: { type: 'varchar', length: 100, value: payload.correo },
        },
      );

      if (existing.recordset?.[0]) {
        await queryDatabase(
          `
            UPDATE Cliente
            SET Nombre = @Nombre,
                IdTipoCliente = @IdTipoCliente,
                PasswordHash = @PasswordHash
            WHERE Correo = @Correo
          `,
          {
            Nombre: { type: 'varchar', length: 100, value: payload.nombre },
            Correo: { type: 'varchar', length: 100, value: payload.correo },
            IdTipoCliente: { type: 'int', value: 2 },
            PasswordHash: { type: 'varchar', length: 256, value: passwordHash },
          },
        );

        return {
          idCliente: existing.recordset[0].idCliente,
          estado: 'Activo',
          tipoCliente: 'Socio Gold VIP',
          codigoActivacion: payload.codigo,
        };
      }

      const insert = await queryDatabase(
        `
          INSERT INTO Cliente (Nombre, Correo, IdTipoCliente, PasswordHash)
          OUTPUT INSERTED.IdCliente AS idCliente
          VALUES (@Nombre, @Correo, @IdTipoCliente, @PasswordHash)
        `,
        {
          Nombre: { type: 'varchar', length: 100, value: payload.nombre },
          Correo: { type: 'varchar', length: 100, value: payload.correo },
          IdTipoCliente: { type: 'int', value: 2 },
          PasswordHash: { type: 'varchar', length: 256, value: passwordHash },
        },
      );

      return {
        idCliente: insert.recordset?.[0]?.idCliente || null,
        estado: 'Activo',
        tipoCliente: 'Socio Gold VIP',
        codigoActivacion: payload.codigo,
      };
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },

  async login(payload) {
    try {
      const result = await queryDatabase(
        `
          SELECT
            'Usuario' AS tipoCuenta,
            u.IdUsuario AS id,
            u.NombreUsuario AS nombre,
            u.Correo AS correo,
            u.PasswordHash AS passwordHash,
            STRING_AGG(r.NombreRol, ',') AS roles
          FROM Usuario u
          LEFT JOIN UsuarioRol ur ON ur.IdUsuario = u.IdUsuario
          LEFT JOIN Rol r ON r.IdRol = ur.IdRol
          WHERE u.Correo = @Correo AND u.Estado = 1
          GROUP BY u.IdUsuario, u.NombreUsuario, u.Correo, u.PasswordHash
          UNION ALL
          SELECT
            'Cliente' AS tipoCuenta,
            c.IdCliente AS id,
            CONCAT(c.Nombre, ' ', COALESCE(c.Apellido, '')) AS nombre,
            c.Correo AS correo,
            c.PasswordHash AS passwordHash,
            'Miembro' AS roles
          FROM Cliente c
          WHERE c.Correo = @Correo AND c.PasswordHash IS NOT NULL
        `,
        {
          Correo: { type: 'varchar', length: 100, value: payload.correo },
        },
      );

      const account = result.recordset?.find((record) => record.passwordHash);
      if (!account) {
        return null;
      }

      const passwordOk = await bcrypt.compare(payload.password, account.passwordHash);
      if (!passwordOk) {
        return null;
      }

      const roles = normalizeRoles(account);
      const user = {
        id: account.id,
        nombre: account.nombre,
        correo: account.correo,
        tipoCuenta: account.tipoCuenta,
        roles,
      };
      const token = signToken({
        id: user.id,
        correo: user.correo,
        tipoCuenta: user.tipoCuenta,
        roles,
      });

      return { token, user };
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },
};
