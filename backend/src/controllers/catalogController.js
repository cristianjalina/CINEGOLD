import { asyncHandler } from '../utils/asyncHandler.js';
import { catalogService } from '../services/catalogService.js';

export const catalogController = {
  movies: asyncHandler(async (_req, res) => {
    const movies = await catalogService.getMovies();
    res.json({ data: movies });
  }),

  featuredMovies: asyncHandler(async (_req, res) => {
    const movies = await catalogService.getFeaturedMovies();
    res.json({ data: movies });
  }),

  upcomingMovies: asyncHandler(async (_req, res) => {
    const movies = await catalogService.getMovies();
    res.json({ data: movies.filter((movie) => movie.proximamente || movie.esPreventa) });
  }),

  cartelera: asyncHandler(async (_req, res) => {
    const overview = await catalogService.getCarteleraOverview();
    res.json({ data: overview });
  }),

  movie: asyncHandler(async (req, res) => {
    const movie = await catalogService.getMovieById(req.params.idPelicula);
    res.json({ data: movie });
  }),

  showtimes: asyncHandler(async (_req, res) => {
    const showtimes = await catalogService.getActiveShowtimes();
    res.json({ data: showtimes });
  }),

  movieShowtimes: asyncHandler(async (req, res) => {
    const showtimes = await catalogService.getShowtimesByMovie(req.params.idPelicula);
    res.json({ data: showtimes });
  }),

  promotions: asyncHandler(async (_req, res) => {
    const promotions = await catalogService.getPromotions();
    res.json({ data: promotions });
  }),

  memberships: asyncHandler(async (_req, res) => {
    const memberships = await catalogService.getMemberships();
    res.json({ data: memberships });
  }),

  genres: asyncHandler(async (_req, res) => {
    const genres = await catalogService.getGenres();
    res.json({ data: genres });
  }),

  combos: asyncHandler(async (_req, res) => {
    const combos = await catalogService.getCombos();
    res.json({ data: combos });
  }),

  information: asyncHandler(async (_req, res) => {
    const sections = await catalogService.getInformationSections();
    res.json({ data: sections });
  }),

  seats: asyncHandler(async (req, res) => {
    const seats = await catalogService.getSeatsByFunction(req.params.idFuncion);
    res.json({ data: seats });
  }),
};
