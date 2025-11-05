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
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ✅ COMENTA TODAS LAS RUTAS TEMPORALMENTE
// app.use('/api/auth', authRoutes);
// app.use('/api/articles', articleRoutes);
// app.use('/api/fotos', fotoRoutes);
// app.use('/api', userRoutes);
// app.use('/api', rolesRoutes);
// app.use("/api/notificaciones", notificacionesRoutes);
// app.use('/api', fileRoutes);
// app.use('/api/categorias', categoriaRoutes);
// app.use('/api/admin', onlineUsersRoutes);
// app.use("/api/logs", logsRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (_req, res) => {
  res.json({ message: 'Backend funcionando sin rutas' });
});

app.use(errorHandler);

export default app;