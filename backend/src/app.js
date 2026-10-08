import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js';
import routes from './routes/index.js';
import { authController } from './controllers/authController.js';
import { validate } from './middlewares/validaotr.js';
import { loginSchema, registerClientSchema } from './validators/authSchemas.js';
import { checkoutController } from './controllers/checkoutController.js';
import { checkoutSchema } from './validators/checkoutSchemas.js';
import { checkDatabaseConnection } from './db/pool.js';
import { queryDatabase } from './db/request.js';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

// Seguridad base
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));

// Procesamiento de JSON y URL encoded con límites controlados
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de desarrollo
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rate Limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/uploads', express.static(env.uploadDir));

// Salud del API
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cinegold-api', timestamp: new Date() });
});

app.get('/health/db', async (_req, res) => {
  try {
    const database = await checkDatabaseConnection();
    res.json({ status: 'ok', database });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'No se pudo conectar a SQL Server.',
      details: error.message,
    });
  }
});

app.get('/health/catalog', async (_req, res) => {
  try {
    const [movies, promotions, products, combos] = await Promise.all([
      queryDatabase('SELECT COUNT(*) AS total FROM Peliculas'),
      queryDatabase('SELECT COUNT(*) AS total FROM Promocion'),
      queryDatabase('SELECT COUNT(*) AS total FROM Producto'),
      queryDatabase('SELECT COUNT(*) AS total FROM Combo'),
    ]);
    res.json({
      status: 'ok',
      totals: {
        peliculas: movies.recordset?.[0]?.total ?? 0,
        promociones: promotions.recordset?.[0]?.total ?? 0,
        productos: products.recordset?.[0]?.total ?? 0,
        combos: combos.recordset?.[0]?.total ?? 0,
      },
    });
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});

app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Rutas de autenticación directa (Login y Registro)
app.post('/login', validate(loginSchema), authController.login);
app.post('/registro', validate(registerClientSchema), authController.registerClient);
app.post('/api/comprar', validate(checkoutSchema), checkoutController.processTicketPurchase);

// Rutas principales bajo el prefijo /api
app.use('/api', routes);

// Manejadores de errores (middleware final)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

