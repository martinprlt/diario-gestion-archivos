// src/app.js
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// Rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import errorHandler from './middlewares/error.middleware.js';
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import articleRoutes from './routes/article.routes.js';
import fotoRoutes from './routes/foto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import onlineUsersRoutes from './routes/onlineUsers.routes.js';
import fileRoutes from './routes/file.routes.js';
import logsRoutes from "./routes/logs.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ 1. CORS - DEBE IR PRIMERO
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://sdgi-elindependiente.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  optionsSuccessStatus: 200
}));

// ✅ 2. Manejar OPTIONS
app.options('*', cors());

// ✅ 3. Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 4. HELMET
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// ✅ 5. RATE LIMITING para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Demasiados intentos de login. Por seguridad, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const isDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    return isDev;
  }
});

// ✅ 6. Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
  next();
});

// ✅ 7. RUTAS - APLICAR RATE LIMITER COMO MIDDLEWARE EN AUTH
app.use('/api/auth', loginLimiter, authRoutes); // ✅ Rate limiter aplicado a TODAS las rutas de auth
app.use('/api/articles', articleRoutes);
app.use('/api/fotos', fotoRoutes);
app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use('/api', fileRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/admin', onlineUsersRoutes);
app.use("/api/logs", logsRoutes);

// ✅ 8. Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ 9. Rutas básicas
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Backend Diario Virtual funcionando 👌',
    cors: 'habilitado',
    origins: allowedOrigins
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test OK',
    origin: req.get('origin'),
    corsEnabled: true
  });
});

// ✅ 10. Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ✅ 11. Middleware de errores
app.use(errorHandler);

export default app;