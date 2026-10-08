import sql from 'mssql';
import { env } from '../config/env.js';

function buildSqlConfig() {
  const [serverName, instanceFromServer] = String(env.db.server || '').split('\\');
  const instanceName = env.db.options.instanceName || instanceFromServer || '';
  const config = {
    user: env.db.user,
    password: env.db.password,
    database: env.db.database || 'CinegoldDB',
    server: serverName || 'localhost',
    options: {
      encrypt: env.db.options.encrypt,
      trustServerCertificate: env.db.options.trustServerCertificate,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
    pool: env.db.pool,
  };

  if (instanceName) {
    config.options.instanceName = instanceName;
  } else if (env.db.port) {
    config.port = env.db.port;
  }

  return config;
}

const config = {
  ...buildSqlConfig(),
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    const target = config.options.instanceName ? `${config.server}\\${config.options.instanceName}` : `${config.server}:${config.port || 1433}`;
    console.log(`Conectado exitosamente a SQL Server (${target}/${config.database})`);
    return pool;
  })
  .catch((err) => {
    const target = config.options.instanceName ? `${config.server}\\${config.options.instanceName}` : `${config.server}:${config.port || 1433}`;
    console.error(`Error al conectar a SQL Server (${target}/${config.database}):`, err.message);
    throw err;
  });

export async function checkDatabaseConnection() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      DB_NAME() AS databaseName,
      SUSER_SNAME() AS loginName,
      SYSDATETIME() AS serverTime
  `);

  return result.recordset?.[0] || null;
}
