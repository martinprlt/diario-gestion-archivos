// src/app.js
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

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

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('trust proxy', 1);

//  1. HELMET - Headers de seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

//  2. CORS - Configuración segura para desarrollo y producción en ambos puertos de prueba
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como Postman o mobile apps)
      if (!origin) return callback(null, true);
      
      // En producción, verificar contra lista
      if (process.env.NODE_ENV === 'production') {
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn('❌ Bloqueado por CORS:', origin);
          callback(new Error('CORS not allowed'));
        }
      } else {
        // En desarrollo, permitir localhost
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

//  3. RATE LIMITING PARA LOGIN (Protección contra fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login cada 15 minutos
  message: {
    error: 'Demasiados intentos de login. Por seguridad, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//  Middlewares básicos
app.use(express.json());

// RUTAS CON SEGURIDAD APLICADA
// Login con rate limiting ESPECÍFICO
app.use('/api/auth/login', loginLimiter); // Limita solo /login
app.use('/api/auth', authRoutes); // Rutas normales de auth

// Resto de rutas
app.use('/api/articles', articleRoutes);
app.use('/api/fotos', fotoRoutes);
app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use('/api', fileRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/admin', onlineUsersRoutes);

//  Rutas estáticas
app.use('/archivos', express.static('archivos'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

//  Rutas básicas
app.get('/', (_req, res) => res.send('Backend Diario Virtual funcionando 👌'));
app.get('/test', (req, res) => res.json({ message: 'Test OK' }));

//  Middleware de errores
app.use(errorHandler);

export default app;
