import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { adminController } from '../controllers/adminController.js';
import { authController } from '../controllers/authController.js';
import { catalogController } from '../controllers/catalogController.js';
import { checkoutController } from '../controllers/checkoutController.js';
import { contactController } from '../controllers/contactController.js';
import { reservationController } from '../controllers/reservationController.js';
import { uploadController } from '../controllers/uploadController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { convertUploadedImageToWebp, uploadImage } from '../middlewares/uploadWebp.js';
import { validate } from '../middlewares/validaotr.js';
import { cinegoldPlusActivationSchema } from '../validators/authSchemas.js';
import {
  comboUpsertSchema,
  functionUpsertSchema,
  movieUpsertSchema,
  productUpsertSchema,
  promotionUpsertSchema,
} from '../validators/adminSchemas.js';
import { checkoutSchema } from '../validators/checkoutSchemas.js';
import { contactSchema } from '../validators/contactSchemas.js';

const router = Router();

router.get('/peliculas', catalogController.movies);
router.get('/peliculas/destacadas', catalogController.featuredMovies);
router.get('/peliculas/cartelera', catalogController.cartelera);
router.get('/peliculas/preventa', catalogController.upcomingMovies);
router.get('/peliculas/:idPelicula', catalogController.movie);
router.get('/funciones', catalogController.showtimes);
router.get('/peliculas/:idPelicula/funciones', catalogController.movieShowtimes);
router.get('/funciones/:idFuncion/asientos', catalogController.seats);
router.get('/promociones', catalogController.promotions);
router.get('/membresias', catalogController.memberships);
router.get('/generos', catalogController.genres);
router.get('/combos', catalogController.combos);
router.get('/informacion', catalogController.information);

router.post('/comprar', validate(checkoutSchema), checkoutController.processTicketPurchase);
router.post('/contacto', validate(contactSchema), contactController.create);
router.post('/cinegold-plus/activar', validate(cinegoldPlusActivationSchema), authController.activateCinegoldPlus);

router.get('/reservas', requireAuth, reservationController.history);
router.get('/admin/dashboard/ventas-mensuales', requireAuth, requireRole(['Administrador', 'SuperAdmin']), analyticsController.monthlySales);
router.get('/admin/metrics', requireAuth, requireRole(['Administrador', 'SuperAdmin']), analyticsController.metrics);

router.get('/admin/peliculas', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.movies);
router.post('/admin/peliculas', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(movieUpsertSchema), adminController.createMovie);
router.put('/admin/peliculas/:idPelicula', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(movieUpsertSchema), adminController.updateMovie);
router.delete('/admin/peliculas/:idPelicula', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.deleteMovie);

router.get('/admin/productos', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.products);
router.post('/admin/productos', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(productUpsertSchema), adminController.createProduct);
router.put('/admin/productos/:idProducto', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(productUpsertSchema), adminController.updateProduct);
router.delete('/admin/productos/:idProducto', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.deleteProduct);

router.get('/admin/combos', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.combos);
router.post('/admin/combos', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(comboUpsertSchema), adminController.createCombo);
router.put('/admin/combos/:idCombo', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(comboUpsertSchema), adminController.updateCombo);
router.delete('/admin/combos/:idCombo', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.deleteCombo);

router.get('/admin/promociones', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.promotions);
router.post('/admin/promociones', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(promotionUpsertSchema), adminController.createPromotion);
router.put('/admin/promociones/:idPromocion', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(promotionUpsertSchema), adminController.updatePromotion);
router.delete('/admin/promociones/:idPromocion', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.deletePromotion);

router.get('/admin/funciones', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.functions);
router.get('/admin/salas', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.rooms);
router.post('/admin/funciones', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(functionUpsertSchema), adminController.createFunction);
router.put('/admin/funciones/:idFuncion', requireAuth, requireRole(['Administrador', 'SuperAdmin']), validate(functionUpsertSchema), adminController.updateFunction);
router.delete('/admin/funciones/:idFuncion', requireAuth, requireRole(['Administrador', 'SuperAdmin']), adminController.deleteFunction);

router.post(
  '/admin/uploads/imagenes',
  requireAuth,
  requireRole(['Administrador', 'SuperAdmin']),
  uploadImage,
  convertUploadedImageToWebp,
  uploadController.image,
);

export default router;
