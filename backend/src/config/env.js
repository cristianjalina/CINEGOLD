import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || '',
    secure: process.env.SMTP_SECURE === 'true',
    ehlo: process.env.SMTP_EHLO || 'cinegold.local',
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
  },
  db: {
    server: process.env.DB_SERVER || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    database: process.env.DB_DATABASE || 'CinegoldDB',
    user: process.env.DB_USER || 'cinegoldApp',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      instanceName: process.env.DB_INSTANCE_NAME || '',
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};


