// backend/src/app.js - VERSIÓN LIMPIA
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import articleRoutes from './routes/article.routes.js';
import fotoRoutes from './routes/foto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import onlineUsersRoutes from './routes/onlineUsers.routes.js';
import fileRoutes from './routes/file.routes.js';
import logsRoutes from "./routes/logs.routes.js";
import errorHandler from './middlewares/error.middleware.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración básica
app.set('trust proxy', 1);

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://sgdi-independiente.up.railway.app'
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());

// Rutas del sistema
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/fotos', fotoRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use('/api', fileRoutes);
app.use('/api/admin', onlineUsersRoutes);
app.use("/api/logs", logsRoutes);

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas básicas
app.get('/', (_req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend Diario Virtual funcionando',
    endpoints: {
      auth: '/api/auth',
      users: '/api/usuarios',
      articles: '/api/articles',
      categories: '/api/categorias',
      photos: '/api/fotos',
      notifications: '/api/notificaciones',
      logs: '/api/logs'
    }
  });
});

app.get('/test', (_req, res) => res.json({ message: 'Test OK' }));

// Manejo global de errores
app.use(errorHandler);

export default app;