import sql from 'mssql';
import { poolPromise } from './pool.js';

export function sqlType(typeName, options = {}) {
  const normalized = String(typeName).toLowerCase();
    const typeMap = {
      int: sql.Int,
      tinyint: sql.TinyInt,
      bit: sql.Bit,
      varchar: sql.VarChar(options.length || sql.MAX),
      nvarchar: sql.NVarChar(options.length || sql.MAX),
    decimal: sql.Decimal(options.precision || 12, options.scale || 2),
    date: sql.Date,
    time: sql.Time,
    datetime: sql.DateTime,
  };

  return typeMap[normalized] || sql.VarChar(sql.MAX);
}

export async function executeProcedure(name, params = {}, outputParams = {}) {
  const pool = await poolPromise;
  const request = pool.request();

  for (const [key, config] of Object.entries(params)) {
    request.input(key, sqlType(config.type, config), config.value ?? null);
  }

  for (const [key, config] of Object.entries(outputParams)) {
    request.output(key, sqlType(config.type, config));
  }

  return request.execute(name);
}

export async function queryDatabase(statement, params = {}) {
  const pool = await poolPromise;
  const request = pool.request();

  for (const [key, config] of Object.entries(params)) {
    request.input(key, sqlType(config.type, config), config.value ?? null);
  }

  return request.query(statement);
}
