// src/app.js - CON RATE LIMITING PARA LOGIN
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

// 🔐 1. HELMET - Headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 🌐 2. CORS - Configuración segura
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔐 3. RATE LIMITING PARA LOGIN (Protección contra fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login cada 15 minutos
  message: {
    error: 'Demasiados intentos de login. Por seguridad, espera 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middlewares básicos
app.use(express.json());

// 🛣️ RUTAS CON SEGURIDAD APLICADA
// IMPORTANTE: Login con rate limiting ESPECÍFICO
app.use('/api/auth/login', loginLimiter); // Aplicar rate limiting a /api/auth/login
app.use('/api/auth', authRoutes); // Luego las rutas de auth normales

// Resto de rutas
app.use('/api/articles', articleRoutes);
app.use('/api/fotos', fotoRoutes);
app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use('/api', fileRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/admin', onlineUsersRoutes);

// Rutas estáticas
app.use('/archivos', express.static('archivos'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/avatars', express.static(path.join(__dirname,'uploads/avatars')));

// Rutas básicas
app.get('/', (_req, res) => res.send('Backend Diario Virtual funcionando 👌'));
app.get('/test', (req, res) => res.json({ message: 'Test OK' }));

app.use(errorHandler);
export default app;