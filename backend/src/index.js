import app from './app.js';
import { env } from './config/env.js';

// Servidor configurado para el entorno definido en .env
const PORT = env.port || 5000;

const server = app.listen(PORT, () => {

  console.log(`CINEGOLD API INICIADA CORRECTAMENTE`);
  console.log(`Puerto: ${PORT}`);
  console.log(`Servidor SQL: ${env.db.server}`);
  console.log(`Base de Datos: ${env.db.database}`);

});

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});
