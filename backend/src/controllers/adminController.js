import { asyncHandler } from '../utils/asyncHandler.js';
import { adminService } from '../services/adminService.js';

export const adminController = {
  movies: asyncHandler(async (_req, res) => res.json({ data: await adminService.listMovies() })),
  createMovie: asyncHandler(async (req, res) => res.status(201).json({ data: await adminService.createMovie(req.validated.body) })),
  updateMovie: asyncHandler(async (req, res) => res.json({ data: await adminService.updateMovie(req.params.idPelicula, req.validated.body) })),
  deleteMovie: asyncHandler(async (req, res) => res.json({ data: await adminService.deleteMovie(req.params.idPelicula) })),

  products: asyncHandler(async (_req, res) => res.json({ data: await adminService.listProducts() })),
  createProduct: asyncHandler(async (req, res) => res.status(201).json({ data: await adminService.createProduct(req.validated.body) })),
  updateProduct: asyncHandler(async (req, res) => res.json({ data: await adminService.updateProduct(req.params.idProducto, req.validated.body) })),
  deleteProduct: asyncHandler(async (req, res) => res.json({ data: await adminService.deleteProduct(req.params.idProducto) })),
  rooms: asyncHandler(async (_req, res) => res.json({ data: await adminService.listRooms() })),

  combos: asyncHandler(async (_req, res) => res.json({ data: await adminService.listCombos() })),
  createCombo: asyncHandler(async (req, res) => res.status(201).json({ data: await adminService.createCombo(req.validated.body) })),
  updateCombo: asyncHandler(async (req, res) => res.json({ data: await adminService.updateCombo(req.params.idCombo, req.validated.body) })),
  deleteCombo: asyncHandler(async (req, res) => res.json({ data: await adminService.deleteCombo(req.params.idCombo) })),

  promotions: asyncHandler(async (_req, res) => res.json({ data: await adminService.listPromotions() })),
  createPromotion: asyncHandler(async (req, res) => res.status(201).json({ data: await adminService.createPromotion(req.validated.body) })),
  updatePromotion: asyncHandler(async (req, res) => res.json({ data: await adminService.updatePromotion(req.params.idPromocion, req.validated.body) })),
  deletePromotion: asyncHandler(async (req, res) => res.json({ data: await adminService.deletePromotion(req.params.idPromocion) })),

  functions: asyncHandler(async (_req, res) => res.json({ data: await adminService.listFunctions() })),
  createFunction: asyncHandler(async (req, res) => res.status(201).json({ data: await adminService.createFunction(req.validated.body) })),
  updateFunction: asyncHandler(async (req, res) => res.json({ data: await adminService.updateFunction(req.params.idFuncion, req.validated.body) })),
  deleteFunction: asyncHandler(async (req, res) => res.json({ data: await adminService.deleteFunction(req.params.idFuncion) })),
};
