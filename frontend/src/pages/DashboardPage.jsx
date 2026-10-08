import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Image as ImageIcon, Film, Package, Ticket, Megaphone, Clock3, BarChart3, Upload, LogOut, Search } from 'lucide-react';
import SalesChart from '../components/charts/SalesChart';
import { fetchMonthlySales } from '../services/analyticsService.js';
import { fetchGenres } from '../services/catalogService.js';
import { formatCurrency, formatTime } from '../utils/formatters.js';
import { adminService } from '../services/adminService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const sections = [
  { id: 'overview', label: 'Analitica', icon: BarChart3 },
  { id: 'movies', label: 'Peliculas', icon: Film },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'combos', label: 'Combos', icon: Ticket },
  { id: 'promotions', label: 'Promociones', icon: Megaphone },
  { id: 'functions', label: 'Funciones', icon: Clock3 },
];

const emptyMovie = {
  titulo: '',
  director: '',
  generos: '',
  sinopsis: '',
  imagenPoster: '',
  duracionMinutos: 0,
  calificacionCritica: 0,
  esExclusivoVip: false,
  proximamente: false,
  trailerYoutubeId: '',
  imagenBackdrop: '',
};

const emptyProduct = {
  codigoTipo: '',
  nombreProducto: '',
  descripcion: '',
  precioActual: 0,
  stock: 0,
  categoria: 'Snacks',
  imagenProducto: '',
};

const emptyCombo = {
  codigoTipo: '',
  nombreCombo: '',
  descripcion: '',
  precioFijo: 0,
  estado: true,
  categoria: 'Combos',
  imagenCombo: '',
};

const emptyPromotion = {
  nombrePromocion: '',
  descripcion: '',
  porcentajeDescuento: 0,
  fechaInicio: '',
  fechaFin: '',
  tipoPromocion: 'Taquilla',
  imagenPromo: '',
  validezTexto: '',
  targets: [],
};

const emptyFunction = {
  idPelicula: 0,
  idSala: 0,
  fecha: '',
  hora: '',
  idioma: 'Español',
  formatoBadge: '2D / TRADICIONAL',
};

function PanelCard({ title, children, tone = 'gold' }) {
  const styles = tone === 'dark'
    ? 'bg-[#111] text-white shadow-[12px_12px_0_#C5A03A]'
    : tone === 'white'
      ? 'bg-white text-black shadow-[12px_12px_0_#C5A03A]'
      : 'bg-[#C5A03A] text-black shadow-[12px_12px_0_white]';
  return (
    <div className={`${styles} p-6 md:p-8`}>
      <h3 className="text-xs uppercase tracking-[0.3em] font-black mb-4 bg-black/5 inline-block px-3 py-1">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.25em] font-black mb-2 text-white/80">{label}</span>
      {children}
    </label>
  );
}

function ActionButton({ children, onClick, tone = 'gold', type = 'button' }) {
  const cls = tone === 'dark'
    ? 'bg-[#111] text-white shadow-[4px_4px_0_#C5A03A]'
    : tone === 'white'
      ? 'bg-white text-black shadow-[4px_4px_0_#C5A03A]'
      : 'bg-[#C5A03A] text-black shadow-[4px_4px_0_white]';
  return (
    <button type={type} onClick={onClick} className={`${cls} px-4 py-3 font-black uppercase tracking-[0.2em] text-xs hover:translate-x-[1px] hover:translate-y-[1px] transition-transform`}>
      {children}
    </button>
  );
}

function normalizeTimeValue(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const compact = value
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.]/g, '')
      .trim();

    const twentyFourHour = compact.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (twentyFourHour) {
      const hour = String(Number(twentyFourHour[1])).padStart(2, '0');
      return `${hour}:${twentyFourHour[2]}:${twentyFourHour[3] || '00'}`;
    }

    const meridiem = compact.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a m|am|p m|pm)$/);
    if (meridiem) {
      let hour = Number(meridiem[1]) % 12;
      if (meridiem[4].startsWith('p')) hour += 12;
      return `${String(hour).padStart(2, '0')}:${meridiem[2]}:${meridiem[3] || '00'}`;
    }

    const timeOnly = compact.match(/^(\d{1,2})\s*(a m|am|p m|pm)$/);
    if (timeOnly) {
      let hour = Number(timeOnly[1]) % 12;
      if (timeOnly[2].startsWith('p')) hour += 12;
      return `${String(hour).padStart(2, '0')}:00:00`;
    }

    const match = compact.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (match) return `${match[1]}:${match[2]}:${match[3] || '00'}`;
    return value.slice(0, 8);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(value);
  }

  return String(value).slice(0, 8);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [section, setSection] = useState('overview');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [movies, setMovies] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [functionsData, setFunctionsData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [comboForm, setComboForm] = useState(emptyCombo);
  const [promotionForm, setPromotionForm] = useState(emptyPromotion);
  const [functionForm, setFunctionForm] = useState(emptyFunction);
  const [editingId, setEditingId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [genrePicker, setGenrePicker] = useState('');
  const [searchTerms, setSearchTerms] = useState({
    movies: '',
    products: '',
    combos: '',
    promotions: '',
    functions: '',
  });

  const totalIngresos = useMemo(() => metrics.reduce((sum, row) => sum + Number(row.TotalRecaudado || 0), 0), [metrics]);
  const totalTransacciones = useMemo(() => metrics.reduce((sum, row) => sum + Number(row.TotalBoletos || 0), 0), [metrics]);

  useEffect(() => {
    async function loadOverview() {
      const data = await fetchMonthlySales();
      setMetrics(data);
    }
    loadOverview();
  }, []);

  async function loadAllData() {
    const loadOne = async (setter, promise) => {
      try {
        const payload = await promise();
        setter(payload?.data || []);
      } catch (error) {
        setMessage(error.message);
        setter([]);
      }
    };

    await Promise.all([
      loadOne(setMovies, adminService.fetchMovies),
      loadOne(setProducts, adminService.fetchProducts),
      loadOne(setCombos, adminService.fetchCombos),
      loadOne(setPromotions, adminService.fetchPromotions),
      loadOne(setFunctionsData, adminService.fetchFunctions),
      loadOne(setRooms, adminService.fetchRooms),
      loadOne(setGenres, fetchGenres),
    ]);
  }

  const filteredMovies = useMemo(() => movies.filter((item) => `${item.titulo || ''} ${item.generos || ''} ${item.director || ''}`.toLowerCase().includes(searchTerms.movies.toLowerCase())), [movies, searchTerms.movies]);
  const filteredProducts = useMemo(() => products.filter((item) => `${item.nombreProducto || ''} ${item.codigoTipo || ''} ${item.categoria || ''}`.toLowerCase().includes(searchTerms.products.toLowerCase())), [products, searchTerms.products]);
  const filteredCombos = useMemo(() => combos.filter((item) => `${item.nombreCombo || ''} ${item.codigoTipo || ''} ${item.categoria || ''}`.toLowerCase().includes(searchTerms.combos.toLowerCase())), [combos, searchTerms.combos]);
  const filteredPromotions = useMemo(() => promotions.filter((item) => `${item.nombrePromocion || ''} ${item.tipoPromocion || ''} ${item.descripcion || ''}`.toLowerCase().includes(searchTerms.promotions.toLowerCase())), [promotions, searchTerms.promotions]);
  const filteredFunctions = useMemo(() => functionsData.filter((item) => `${item.peliculaTitulo || ''} ${item.numeroSala || ''} ${item.nombreCine || ''} ${item.idioma || ''}`.toLowerCase().includes(searchTerms.functions.toLowerCase())), [functionsData, searchTerms.functions]);
  const genreOptions = useMemo(() => genres, [genres]);
  const movieGenreOptions = useMemo(() => {
    const defaults = [
      'Accion',
      'Animacion',
      'Aventura',
      'Biografia',
      'Ciencia Ficcion',
      'Comedia',
      'Crimen',
      'Drama',
      'Familiar',
      'Fantasia',
      'Infantil',
      'Musical',
      'Romance',
      'Superheroes',
      'Suspenso',
      'Terror',
      'Thriller',
    ];
    const fromMovies = movies.flatMap((item) => String(item.generos || '').split(',').map((genre) => genre.trim()).filter(Boolean));
    return Array.from(new Set([...defaults, ...genreOptions, ...fromMovies])).filter(Boolean);
  }, [genreOptions, movies]);

  useEffect(() => {
    if (section !== 'overview') {
      setLoading(true);
      loadAllData()
        .catch((error) => setMessage(error.message))
        .finally(() => setLoading(false));
    }
  }, [section]);

  useEffect(() => {
    const handleExpired = () => {
      setMessage('Tu sesion expiró. Inicia sesion otra vez.');
      signOut();
      navigate('/login');
    };

    window.addEventListener('cinegold:auth-expired', handleExpired);
    return () => window.removeEventListener('cinegold:auth-expired', handleExpired);
  }, [navigate, signOut]);

  function resetForms() {
    setMovieForm(emptyMovie);
    setProductForm(emptyProduct);
    setComboForm(emptyCombo);
    setPromotionForm(emptyPromotion);
    setFunctionForm(emptyFunction);
    setEditingId(null);
    setUploadFile(null);
    setGenrePicker('');
  }

  function addGenreToMovie() {
    if (!genrePicker) return;
    setMovieForm((current) => {
      const currentGenres = String(current.generos || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (currentGenres.includes(genrePicker)) return current;
      return { ...current, generos: [...currentGenres, genrePicker].join(', ') };
    });
    setGenrePicker('');
  }

  function beginEditMovie(item) {
    setSection('movies');
    setEditingId(item.idPelicula);
    setMovieForm({
      titulo: item.titulo || '',
      director: item.director || '',
      sinopsis: item.sinopsis || '',
      imagenPoster: item.imagenPoster || '',
      duracionMinutos: Number(item.duracionMinutos || 0),
      calificacionCritica: Number(item.calificacionCritica || 0),
      esExclusivoVip: Boolean(item.esExclusivoVip),
      proximamente: Boolean(item.proximamente),
      trailerYoutubeId: item.trailerYoutubeId || '',
      imagenBackdrop: item.imagenBackdrop || '',
      generos: item.generos || '',
    });
    setGenrePicker('');
  }

  function beginEditProduct(item) {
    setSection('products');
    setEditingId(item.idProducto);
    setProductForm({
      codigoTipo: item.codigoTipo || '',
      nombreProducto: item.nombreProducto || '',
      descripcion: item.descripcion || '',
      precioActual: Number(item.precioActual || 0),
      stock: Number(item.stock || 0),
      categoria: item.categoria || 'Snacks',
      imagenProducto: item.imagenProducto || '',
    });
  }

  function beginEditCombo(item) {
    setSection('combos');
    setEditingId(item.idCombo);
    setComboForm({
      codigoTipo: item.codigoTipo || '',
      nombreCombo: item.nombreCombo || '',
      descripcion: item.descripcion || '',
      precioFijo: Number(item.precioFijo || 0),
      estado: Boolean(item.estado),
      categoria: item.categoria || 'Combos',
      imagenCombo: item.imagenCombo || '',
    });
  }

  function beginEditPromotion(item) {
    setSection('promotions');
    setEditingId(item.idPromocion);
    setPromotionForm({
      nombrePromocion: item.nombrePromocion || '',
      descripcion: item.descripcion || '',
      porcentajeDescuento: Number(item.porcentajeDescuento || 0),
      fechaInicio: item.fechaInicio ? String(item.fechaInicio).slice(0, 16) : '',
      fechaFin: item.fechaFin ? String(item.fechaFin).slice(0, 16) : '',
      tipoPromocion: item.tipoPromocion || 'Taquilla',
      imagenPromo: item.imagenPromo || '',
      validezTexto: item.validezTexto || '',
      targets: item.targets || [],
    });
  }

  function togglePromotionTarget(tipo, id) {
    setPromotionForm((current) => {
      const exists = current.targets.some((item) => item.tipo === tipo && Number(item.id) === Number(id));
      return {
        ...current,
        targets: exists
          ? current.targets.filter((item) => !(item.tipo === tipo && Number(item.id) === Number(id)))
          : [...current.targets, { tipo, id: Number(id) }],
      };
    });
  }

function beginEditFunction(item) {
    setSection('functions');
    setEditingId(item.idFuncion);
    setFunctionForm({
      idPelicula: Number(item.idPelicula || 0),
      idSala: Number(item.idSala || 0),
      fecha: item.fecha ? String(item.fecha).slice(0, 10) : '',
      // CAMBIO AQUÍ: Enviamos el formato limpio de 24h al input, no el formatTime()
      hora: normalizeTimeValue(item.hora).slice(0, 5),
      idioma: item.idioma || 'Español',
      formatoBadge: item.formatoBadge || '2D / TRADICIONAL',
    });
  }
  const movieOptions = movies.map((movie) => ({
    value: movie.idPelicula,
    label: movie.titulo,
  }));

  const roomOptions = rooms.map((room) => ({
    value: room.idSala,
    label: `Sala ${room.numeroSala}${room.tipoSala ? ` - ${room.tipoSala}` : ''}${room.nombreCine ? ` - ${room.nombreCine}` : ''}`,
  }));

  const promotionTargetLabel = (target) => {
    if (target.tipo === 'Pelicula') {
      return movies.find((movie) => Number(movie.idPelicula) === Number(target.id))?.titulo || `Pelicula #${target.id}`;
    }
    if (target.tipo === 'Producto') {
      return products.find((product) => Number(product.idProducto) === Number(target.id))?.nombreProducto || `Producto #${target.id}`;
    }
    if (target.tipo === 'Combo') {
      return combos.find((combo) => Number(combo.idCombo) === Number(target.id))?.nombreCombo || `Combo #${target.id}`;
    }
    return `${target.tipo} #${target.id}`;
  };

  async function saveMovie(e) {
    e.preventDefault();
    setMessage('');
    const payload = {
      ...movieForm,
      duracionMinutos: Number(movieForm.duracionMinutos),
      calificacionCritica: Number(movieForm.calificacionCritica),
    };
    await (editingId ? adminService.updateMovie(editingId, payload) : adminService.createMovie(payload));
    await loadAllData();
    window.dispatchEvent(new Event('cinegold:data-changed'));
    resetForms();
    setMessage('Pelicula guardada.');
  }

  async function saveProduct(e) {
    e.preventDefault();
    setMessage('');
    const payload = {
      ...productForm,
      precioActual: Number(productForm.precioActual),
      stock: Number(productForm.stock),
    };
    await (editingId ? adminService.updateProduct(editingId, payload) : adminService.createProduct(payload));
    await loadAllData();
    window.dispatchEvent(new Event('cinegold:data-changed'));
    resetForms();
    setMessage('Producto guardado.');
  }

  async function saveCombo(e) {
    e.preventDefault();
    setMessage('');
    const payload = { ...comboForm, precioFijo: Number(comboForm.precioFijo) };
    await (editingId ? adminService.updateCombo(editingId, payload) : adminService.createCombo(payload));
    await loadAllData();
    window.dispatchEvent(new Event('cinegold:data-changed'));
    resetForms();
    setMessage('Combo guardado.');
  }

  async function savePromotion(e) {
    e.preventDefault();
    setMessage('');
    const payload = {
      ...promotionForm,
      porcentajeDescuento: Number(promotionForm.porcentajeDescuento),
      fechaInicio: promotionForm.fechaInicio,
      fechaFin: promotionForm.fechaFin,
      targets: promotionForm.targets,
    };
    await (editingId ? adminService.updatePromotion(editingId, payload) : adminService.createPromotion(payload));
    await loadAllData();
    window.dispatchEvent(new Event('cinegold:data-changed'));
    resetForms();
    setMessage('Promocion guardada.');
  }

  async function saveFunction(e) {
    e.preventDefault();
    setMessage('');
    const idPelicula = Number(functionForm.idPelicula);
    const idSala = Number(functionForm.idSala);
    if (!idPelicula || !idSala) {
      setMessage('Selecciona una pelicula y una sala validas.');
      return;
    }
    const payload = {
      ...functionForm,
      idPelicula,
      idSala,
      hora: normalizeTimeValue(functionForm.hora),
    };
    try {
      await (editingId ? adminService.updateFunction(editingId, payload) : adminService.createFunction(payload));
      await loadAllData();
      window.dispatchEvent(new Event('cinegold:data-changed'));
      resetForms();
      setMessage('Funcion guardada.');
    } catch (error) {
      setMessage(error.details?.[0]?.error || error.message || 'No se pudo guardar la funcion.');
    }
  }
  async function handleDelete(type, id) {
    if (!window.confirm('Confirmas eliminar este registro?')) return;
    if (type === 'movie') await adminService.deleteMovie(id);
    if (type === 'product') await adminService.deleteProduct(id);
    if (type === 'combo') await adminService.deleteCombo(id);
    if (type === 'promotion') await adminService.deletePromotion(id);
    if (type === 'function') await adminService.deleteFunction(id);
    await loadAllData();
    window.dispatchEvent(new Event('cinegold:data-changed'));
    setMessage('Registro eliminado.');
  }

  async function handleUploadImage() {
    if (!uploadFile) return;
    const result = await adminService.uploadImage(uploadFile);
    const imageUrl = result?.url || result?.path || result?.filename || '';
    if (imageUrl && section === 'movies') {
      setMovieForm((current) => ({ ...current, imagenPoster: imageUrl }));
    }
    if (imageUrl && section === 'products') {
      setProductForm((current) => ({ ...current, imagenProducto: imageUrl }));
    }
    if (imageUrl && section === 'combos') {
      setComboForm((current) => ({ ...current, imagenCombo: imageUrl }));
    }
    if (imageUrl && section === 'promotions') {
      setPromotionForm((current) => ({ ...current, imagenPromo: imageUrl }));
    }
    setMessage(`Imagen subida: ${imageUrl || 'ok'}`);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="bg-[#0b0b0b] border-r border-[#C5A03A]/30 p-6 md:p-8 xl:min-h-screen xl:sticky xl:top-0">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-[#C5A03A] font-black mb-2">Panel Administrativo</p>
            <h1 className="text-4xl font-black leading-none uppercase">Cinegold</h1>
          </div>
          <nav className="space-y-3">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-4 text-left border transition-all ${
                  section === id
                    ? 'bg-[#C5A03A] text-black border-[#C5A03A]'
                    : 'bg-white/5 text-white border-white/10 hover:border-[#C5A03A]/50 hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                <span className="font-black uppercase tracking-[0.2em] text-xs">{label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-8 space-y-3">
            <ActionButton tone="white" onClick={() => navigate('/')}>Ir al sitio</ActionButton>
            <ActionButton
              tone="dark"
              onClick={() => {
                signOut();
                navigate('/');
              }}
            >
              Cerrar Sesion
            </ActionButton>
          </div>
        </aside>

        <main className="p-6 md:p-8 xl:p-10">
          {message ? (
            <div className="mb-6 bg-white text-black px-4 py-3 font-bold border-l-8 border-[#C5A03A]">{message}</div>
          ) : null}

          {section === 'overview' ? (
            <>
              <div className="bg-[#C5A03A] p-8 md:p-12 shadow-[12px_12px_0_white] mb-10">
                <h2 className="text-4xl md:text-6xl font-black text-black uppercase leading-none mb-4">Panel Analitico</h2>
                <p className="text-black font-black uppercase tracking-[0.25em] text-sm bg-white inline-block px-4 py-2">Nivel: Administrador Global</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <PanelCard title="Ingresos del mes" tone="dark">
                  <p className="text-5xl font-black text-[#C5A03A]">{formatCurrency(totalIngresos)}</p>
                </PanelCard>
                <PanelCard title="Boletos vendidos" tone="white">
                  <p className="text-5xl font-black">{totalTransacciones.toLocaleString('es-NI')}</p>
                </PanelCard>
                <PanelCard title="Meses con ventas" tone="gold">
                  <p className="text-5xl font-black">{metrics.length}</p>
                </PanelCard>
              </div>
              <div className="bg-[#111] p-6 md:p-8 shadow-[16px_16px_0_#222]">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-6">Tendencia de Ventas</h3>
                <div className="h-96 bg-black p-4">
                  <SalesChart metrics={metrics} />
                </div>
              </div>
            </>
          ) : null}

          {section === 'movies' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <PanelCard title={editingId ? 'Editar Pelicula' : 'Nueva Pelicula'} tone="dark">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveMovie}>
                  <Field label="Titulo"><input className="w-full bg-white text-black px-4 py-3" value={movieForm.titulo} onChange={(e) => setMovieForm({ ...movieForm, titulo: e.target.value })} /></Field>
                  <Field label="Director"><input className="w-full bg-white text-black px-4 py-3" value={movieForm.director} onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })} /></Field>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                    <Field label="Genero">
                      <select className="w-full bg-white text-black px-4 py-3" value={genrePicker} onChange={(e) => setGenrePicker(e.target.value)}>
                        <option value="">Selecciona un genero</option>
                        {movieGenreOptions.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="self-end">
                      <ActionButton tone="dark" onClick={addGenreToMovie}>Agregar genero</ActionButton>
                    </div>
                    <Field label="Generos seleccionados">
                      <input className="w-full bg-white text-black px-4 py-3 md:col-span-2" value={movieForm.generos} onChange={(e) => setMovieForm({ ...movieForm, generos: e.target.value })} placeholder="Accion, Drama" />
                    </Field>
                  </div>
                  <Field label="Sinopsis" ><textarea className="w-full bg-white text-black px-4 py-3 min-h-[120px] md:col-span-2" value={movieForm.sinopsis} onChange={(e) => setMovieForm({ ...movieForm, sinopsis: e.target.value })} /></Field>
                  <Field label="Imagen Poster"><input className="w-full bg-white text-black px-4 py-3" value={movieForm.imagenPoster} onChange={(e) => setMovieForm({ ...movieForm, imagenPoster: e.target.value })} /></Field>
                  <Field label="Imagen Backdrop"><input className="w-full bg-white text-black px-4 py-3" value={movieForm.imagenBackdrop} onChange={(e) => setMovieForm({ ...movieForm, imagenBackdrop: e.target.value })} /></Field>
                  <Field label="Duracion"><input type="number" className="w-full bg-white text-black px-4 py-3" value={movieForm.duracionMinutos} onChange={(e) => setMovieForm({ ...movieForm, duracionMinutos: e.target.value })} /></Field>
                  <Field label="Calificacion"><input type="number" step="0.1" className="w-full bg-white text-black px-4 py-3" value={movieForm.calificacionCritica} onChange={(e) => setMovieForm({ ...movieForm, calificacionCritica: e.target.value })} /></Field>
                  <Field label="Trailer YouTube"><input className="w-full bg-white text-black px-4 py-3" value={movieForm.trailerYoutubeId} onChange={(e) => setMovieForm({ ...movieForm, trailerYoutubeId: e.target.value })} /></Field>
                  <div className="flex gap-4 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={movieForm.esExclusivoVip} onChange={(e) => setMovieForm({ ...movieForm, esExclusivoVip: e.target.checked })} /> Exclusiva VIP</label>
                    <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={movieForm.proximamente} onChange={(e) => setMovieForm({ ...movieForm, proximamente: e.target.checked })} /> Proximamente</label>
                  </div>
                  <p className="md:col-span-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                    Imagen Backdrop: usa una imagen horizontal grande para fondos o banners.
                  </p>
                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <ActionButton type="submit">{editingId ? 'Actualizar' : 'Crear'}</ActionButton>
                    <ActionButton tone="white" onClick={resetForms}>Limpiar</ActionButton>
                    <label className="inline-flex items-center gap-3 bg-white text-black px-4 py-3 font-black cursor-pointer">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                      {uploadFile ? uploadFile.name : 'Subir imagen'}
                    </label>
                    <ActionButton tone="dark" onClick={handleUploadImage}>Cargar imagen</ActionButton>
                  </div>
                </form>
              </PanelCard>
              <PanelCard title="Listado de Peliculas" tone="white">
                <div className="mb-4 flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/10">
                  <Search size={16} />
                  <input
                    value={searchTerms.movies}
                    onChange={(e) => setSearchTerms((curr) => ({ ...curr, movies: e.target.value }))}
                    placeholder="Buscar pelicula..."
                    className="w-full bg-transparent outline-none font-bold"
                  />
                </div>
                <div className="overflow-auto max-h-[72vh]">
                  <table className="w-full text-sm">
                    <thead className="text-left">
                      <tr className="border-b border-black/20">
                        <th className="py-2">Titulo</th><th>Dur</th><th>VIP</th><th>Prox</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovies.map((item) => (
                        <tr key={item.idPelicula} className="border-b border-black/10">
                          <td className="py-2 font-bold">{item.titulo}</td>
                          <td>{item.duracionMinutos}</td>
                          <td>{String(item.esExclusivoVip)}</td>
                          <td>{String(item.proximamente)}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              <ActionButton tone="dark" onClick={() => beginEditMovie(item)}><Pencil size={14} /></ActionButton>
                              <ActionButton tone="dark" onClick={() => handleDelete('movie', item.idPelicula)}><Trash2 size={14} /></ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredMovies.length ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-black/60 font-bold uppercase tracking-[0.2em]">
                            No hay peliculas cargadas
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </PanelCard>
            </div>
          ) : null}

          {section === 'products' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <PanelCard title={editingId ? 'Editar Producto' : 'Nuevo Producto'} tone="dark">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveProduct}>
                  <Field label="Codigo"><input className="w-full bg-white text-black px-4 py-3" value={productForm.codigoTipo} onChange={(e) => setProductForm({ ...productForm, codigoTipo: e.target.value })} /></Field>
                  <Field label="Nombre"><input className="w-full bg-white text-black px-4 py-3" value={productForm.nombreProducto} onChange={(e) => setProductForm({ ...productForm, nombreProducto: e.target.value })} /></Field>
                  <Field label="Descripcion"><textarea className="w-full bg-white text-black px-4 py-3 min-h-[110px] md:col-span-2" value={productForm.descripcion} onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })} /></Field>
                  <Field label="Precio"><input type="number" step="0.01" className="w-full bg-white text-black px-4 py-3" value={productForm.precioActual} onChange={(e) => setProductForm({ ...productForm, precioActual: e.target.value })} /></Field>
                  <Field label="Stock"><input type="number" className="w-full bg-white text-black px-4 py-3" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /></Field>
                  <Field label="Categoria"><input className="w-full bg-white text-black px-4 py-3" value={productForm.categoria} onChange={(e) => setProductForm({ ...productForm, categoria: e.target.value })} /></Field>
                  <Field label="Imagen"><input className="w-full bg-white text-black px-4 py-3" value={productForm.imagenProducto} onChange={(e) => setProductForm({ ...productForm, imagenProducto: e.target.value })} /></Field>
                  <div className="md:col-span-2 flex gap-3">
                    <ActionButton type="submit">{editingId ? 'Actualizar' : 'Crear'}</ActionButton>
                    <ActionButton tone="white" onClick={resetForms}>Limpiar</ActionButton>
                  </div>
                </form>
              </PanelCard>
              <PanelCard title="Listado de Productos" tone="white">
                <div className="mb-4 flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/10">
                  <Search size={16} />
                  <input value={searchTerms.products} onChange={(e) => setSearchTerms((curr) => ({ ...curr, products: e.target.value }))} placeholder="Buscar producto..." className="w-full bg-transparent outline-none font-bold" />
                </div>
                <div className="overflow-auto max-h-[72vh]">
                  <table className="w-full text-sm">
                    <tbody>
                      {filteredProducts.map((item) => (
                        <tr key={item.idProducto} className="border-b border-black/10">
                          <td className="py-2 font-bold">{item.nombreProducto}</td>
                          <td>{formatCurrency(item.precioActual)}</td>
                          <td>{item.stock}</td>
                          <td>
                            <div className="flex gap-2">
                              <ActionButton tone="dark" onClick={() => beginEditProduct(item)}><Pencil size={14} /></ActionButton>
                              <ActionButton tone="dark" onClick={() => handleDelete('product', item.idProducto)}><Trash2 size={14} /></ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredProducts.length ? (
                        <tr><td className="py-8 text-center text-black/60 font-bold uppercase tracking-[0.2em]" colSpan={4}>No hay productos cargados</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </PanelCard>
            </div>
          ) : null}

          {section === 'combos' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <PanelCard title={editingId ? 'Editar Combo' : 'Nuevo Combo'} tone="dark">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveCombo}>
                  <Field label="Codigo"><input className="w-full bg-white text-black px-4 py-3" value={comboForm.codigoTipo} onChange={(e) => setComboForm({ ...comboForm, codigoTipo: e.target.value })} /></Field>
                  <Field label="Nombre"><input className="w-full bg-white text-black px-4 py-3" value={comboForm.nombreCombo} onChange={(e) => setComboForm({ ...comboForm, nombreCombo: e.target.value })} /></Field>
                  <Field label="Descripcion"><textarea className="w-full bg-white text-black px-4 py-3 min-h-[110px] md:col-span-2" value={comboForm.descripcion} onChange={(e) => setComboForm({ ...comboForm, descripcion: e.target.value })} /></Field>
                  <Field label="Precio"><input type="number" step="0.01" className="w-full bg-white text-black px-4 py-3" value={comboForm.precioFijo} onChange={(e) => setComboForm({ ...comboForm, precioFijo: e.target.value })} /></Field>
                  <Field label="Categoria"><input className="w-full bg-white text-black px-4 py-3" value={comboForm.categoria} onChange={(e) => setComboForm({ ...comboForm, categoria: e.target.value })} /></Field>
                  <Field label="Imagen"><input className="w-full bg-white text-black px-4 py-3" value={comboForm.imagenCombo} onChange={(e) => setComboForm({ ...comboForm, imagenCombo: e.target.value })} /></Field>
                  <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={comboForm.estado} onChange={(e) => setComboForm({ ...comboForm, estado: e.target.checked })} /> Activo</label>
                  <div className="md:col-span-2 flex gap-3">
                    <ActionButton type="submit">{editingId ? 'Actualizar' : 'Crear'}</ActionButton>
                    <ActionButton tone="white" onClick={resetForms}>Limpiar</ActionButton>
                  </div>
                </form>
              </PanelCard>
              <PanelCard title="Listado de Combos" tone="white">
                <div className="mb-4 flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/10">
                  <Search size={16} />
                  <input value={searchTerms.combos} onChange={(e) => setSearchTerms((curr) => ({ ...curr, combos: e.target.value }))} placeholder="Buscar combo..." className="w-full bg-transparent outline-none font-bold" />
                </div>
                <div className="overflow-auto max-h-[72vh]">
                  <table className="w-full text-sm">
                    <tbody>
                      {filteredCombos.map((item) => (
                        <tr key={item.idCombo} className="border-b border-black/10">
                          <td className="py-2 font-bold">{item.nombreCombo}</td>
                          <td>{formatCurrency(item.precioFijo)}</td>
                          <td>{String(item.estado)}</td>
                          <td>
                            <div className="flex gap-2">
                              <ActionButton tone="dark" onClick={() => beginEditCombo(item)}><Pencil size={14} /></ActionButton>
                              <ActionButton tone="dark" onClick={() => handleDelete('combo', item.idCombo)}><Trash2 size={14} /></ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredCombos.length ? (
                        <tr><td className="py-8 text-center text-black/60 font-bold uppercase tracking-[0.2em]" colSpan={4}>No hay combos cargados</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </PanelCard>
            </div>
          ) : null}

          {section === 'promotions' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <PanelCard title={editingId ? 'Editar Promocion' : 'Nueva Promocion'} tone="dark">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={savePromotion}>
                  <Field label="Nombre"><input className="w-full bg-white text-black px-4 py-3" value={promotionForm.nombrePromocion} onChange={(e) => setPromotionForm({ ...promotionForm, nombrePromocion: e.target.value })} /></Field>
                  <Field label="Tipo"><input className="w-full bg-white text-black px-4 py-3" value={promotionForm.tipoPromocion} onChange={(e) => setPromotionForm({ ...promotionForm, tipoPromocion: e.target.value })} /></Field>
                  <Field label="Descripcion"><textarea className="w-full bg-white text-black px-4 py-3 min-h-[110px] md:col-span-2" value={promotionForm.descripcion} onChange={(e) => setPromotionForm({ ...promotionForm, descripcion: e.target.value })} /></Field>
                  <Field label="Descuento"><input type="number" step="0.01" className="w-full bg-white text-black px-4 py-3" value={promotionForm.porcentajeDescuento} onChange={(e) => setPromotionForm({ ...promotionForm, porcentajeDescuento: e.target.value })} /></Field>
                  <Field label="Inicio"><input type="datetime-local" className="w-full bg-white text-black px-4 py-3" value={promotionForm.fechaInicio} onChange={(e) => setPromotionForm({ ...promotionForm, fechaInicio: e.target.value })} /></Field>
                  <Field label="Fin"><input type="datetime-local" className="w-full bg-white text-black px-4 py-3" value={promotionForm.fechaFin} onChange={(e) => setPromotionForm({ ...promotionForm, fechaFin: e.target.value })} /></Field>
                  <Field label="Imagen"><input className="w-full bg-white text-black px-4 py-3" value={promotionForm.imagenPromo} onChange={(e) => setPromotionForm({ ...promotionForm, imagenPromo: e.target.value })} /></Field>
                  <Field label="Validez"><input className="w-full bg-white text-black px-4 py-3" value={promotionForm.validezTexto} onChange={(e) => setPromotionForm({ ...promotionForm, validezTexto: e.target.value })} /></Field>
                  <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 border border-white/10">
                      <h4 className="text-xs uppercase tracking-[0.25em] font-black mb-3">Peliculas</h4>
                      <div className="max-h-48 overflow-auto space-y-2">
                        {movies.map((movie) => (
                          <label key={`movie-${movie.idPelicula}`} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={promotionForm.targets.some((item) => item.tipo === 'Pelicula' && Number(item.id) === Number(movie.idPelicula))}
                              onChange={() => togglePromotionTarget('Pelicula', movie.idPelicula)}
                            />
                            <span>{movie.titulo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 border border-white/10">
                      <h4 className="text-xs uppercase tracking-[0.25em] font-black mb-3">Productos</h4>
                      <div className="max-h-48 overflow-auto space-y-2">
                        {products.map((product) => (
                          <label key={`product-${product.idProducto}`} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={promotionForm.targets.some((item) => item.tipo === 'Producto' && Number(item.id) === Number(product.idProducto))}
                              onChange={() => togglePromotionTarget('Producto', product.idProducto)}
                            />
                            <span>{product.nombreProducto}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 border border-white/10">
                      <h4 className="text-xs uppercase tracking-[0.25em] font-black mb-3">Combos</h4>
                      <div className="max-h-48 overflow-auto space-y-2">
                        {combos.map((combo) => (
                          <label key={`combo-${combo.idCombo}`} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={promotionForm.targets.some((item) => item.tipo === 'Combo' && Number(item.id) === Number(combo.idCombo))}
                              onChange={() => togglePromotionTarget('Combo', combo.idCombo)}
                            />
                            <span>{combo.nombreCombo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <ActionButton type="submit">{editingId ? 'Actualizar' : 'Crear'}</ActionButton>
                    <ActionButton tone="white" onClick={resetForms}>Limpiar</ActionButton>
                  </div>
                </form>
              </PanelCard>
              <PanelCard title="Listado de Promociones" tone="white">
                <div className="mb-4 flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/10">
                  <Search size={16} />
                  <input value={searchTerms.promotions} onChange={(e) => setSearchTerms((curr) => ({ ...curr, promotions: e.target.value }))} placeholder="Buscar promocion..." className="w-full bg-transparent outline-none font-bold" />
                </div>
                <div className="overflow-auto max-h-[72vh]">
                  <table className="w-full text-sm">
                    <thead className="text-left">
                      <tr className="border-b border-black/20">
                        <th className="py-2">Nombre</th>
                        <th>Tipo</th>
                        <th>Descuento</th>
                        <th>Objetivos</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPromotions.map((item) => (
                        <tr key={item.idPromocion} className="border-b border-black/10">
                          <td className="py-2 font-bold">{item.nombrePromocion}</td>
                          <td>{item.tipoPromocion}</td>
                          <td>{item.porcentajeDescuento}%</td>
                          <td className="text-xs uppercase tracking-[0.15em] text-black/60">
                            {(item.targets || []).length
                              ? item.targets.map((target) => promotionTargetLabel(target)).join(' | ')
                              : 'Sin relaciones'}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <ActionButton tone="dark" onClick={() => beginEditPromotion(item)}><Pencil size={14} /></ActionButton>
                              <ActionButton tone="dark" onClick={() => handleDelete('promotion', item.idPromocion)}><Trash2 size={14} /></ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredPromotions.length ? (
                        <tr><td className="py-8 text-center text-black/60 font-bold uppercase tracking-[0.2em]" colSpan={5}>No hay promociones cargadas</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </PanelCard>
            </div>
          ) : null}

          {section === 'functions' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <PanelCard title={editingId ? 'Editar Funcion' : 'Nueva Funcion'} tone="dark">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveFunction}>
                  <Field label="Pelicula">
                    <select className="w-full bg-white text-black px-4 py-3" value={functionForm.idPelicula} onChange={(e) => setFunctionForm({ ...functionForm, idPelicula: Number(e.target.value) })}>
                      <option value={0}>Selecciona una pelicula</option>
                      {movieOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sala">
                    <select className="w-full bg-white text-black px-4 py-3" value={functionForm.idSala} onChange={(e) => setFunctionForm({ ...functionForm, idSala: Number(e.target.value) })}>
                      <option value={0}>Selecciona una sala</option>
                      {roomOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Fecha"><input type="date" className="w-full bg-white text-black px-4 py-3" value={functionForm.fecha} onChange={(e) => setFunctionForm({ ...functionForm, fecha: e.target.value })} /></Field>
                  <Field label="Hora"><input type="time" className="w-full bg-white text-black px-4 py-3" value={functionForm.hora} onChange={(e) => setFunctionForm({ ...functionForm, hora: e.target.value })} /></Field>
                  <Field label="Idioma"><input className="w-full bg-white text-black px-4 py-3" value={functionForm.idioma} onChange={(e) => setFunctionForm({ ...functionForm, idioma: e.target.value })} /></Field>
                  <Field label="Formato"><input className="w-full bg-white text-black px-4 py-3" value={functionForm.formatoBadge} onChange={(e) => setFunctionForm({ ...functionForm, formatoBadge: e.target.value })} /></Field>
                  <div className="md:col-span-2 flex gap-3">
                    <ActionButton type="submit">{editingId ? 'Actualizar' : 'Crear'}</ActionButton>
                    <ActionButton tone="white" onClick={resetForms}>Limpiar</ActionButton>
                  </div>
                </form>
              </PanelCard>
              <PanelCard title="Listado de Funciones" tone="white">
                <div className="mb-4 flex items-center gap-2 bg-black/5 px-3 py-2 border border-black/10">
                  <Search size={16} />
                  <input value={searchTerms.functions} onChange={(e) => setSearchTerms((curr) => ({ ...curr, functions: e.target.value }))} placeholder="Buscar funcion..." className="w-full bg-transparent outline-none font-bold" />
                </div>
                <div className="overflow-auto max-h-[72vh]">
                  <table className="w-full text-sm">
                    <tbody>
                      {filteredFunctions.map((item) => (
                        <tr key={item.idFuncion} className="border-b border-black/10">
                          <td className="py-2 font-bold">{item.peliculaTitulo || `Pelicula #${item.idPelicula}`}</td>
                          <td>{item.nombreCine ? `${item.nombreCine} - ` : ''}Sala {item.numeroSala || item.idSala}{item.tipoSala ? ` (${item.tipoSala})` : ''}</td>
                          <td>{String(item.fecha).slice(0, 10)}</td>
                          <td>{formatTime(item.hora)}</td>
                          <td>
                            <div className="flex gap-2">
                              <ActionButton tone="dark" onClick={() => beginEditFunction(item)}><Pencil size={14} /></ActionButton>
                              <ActionButton tone="dark" onClick={() => handleDelete('function', item.idFuncion)}><Trash2 size={14} /></ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredFunctions.length ? (
                        <tr><td className="py-8 text-center text-black/60 font-bold uppercase tracking-[0.2em]" colSpan={5}>No hay funciones cargadas</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </PanelCard>
            </div>
          ) : null}

          {loading ? <div className="mt-6 text-sm uppercase tracking-[0.3em] font-black text-[#C5A03A]">Cargando...</div> : null}
        </main>
      </div>
    </div>
  );
}

