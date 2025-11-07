// src/app.js - BACKEND PARA RAILWAY (TRUST PROXY + CORS + RATE LIMIT)
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
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

/* =====================================================
   🌐 0. TRUST PROXY - CRÍTICO PARA RAILWAY
===================================================== */
// ✅ Railway usa proxy reverso, debemos confiar en él
app.set('trust proxy', 1); // Confiar en el primer proxy
console.log('✅ Trust proxy habilitado (Railway compatible)');

/* =====================================================
   🌐 1. CORS UNIFICADO - Configuración centralizada
===================================================== */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://sgdi-independiente.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean); // elimina nulos o undefined

console.log('🔄 Orígenes CORS permitidos:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (por ejemplo, desde Postman o back interno)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado para origen:', origin);
      console.log('✅ Orígenes permitidos:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

/* =====================================================
   🔐 2. HELMET - Seguridad HTTP
===================================================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);



/* =====================================================
   🧩 4. MIDDLEWARES BÁSICOS
===================================================== */
app.use(express.json());

/* =====================================================
   🛣️ 5. RUTAS DEL SISTEMA
===================================================== */
// Aplica limitador SOLO al login
app.use('/api/auth', authRoutes);

app.use('/api/articles', articleRoutes);
app.use('/api/fotos', fotoRoutes);
app.use('/api', userRoutes);
app.use('/api', rolesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use('/api', fileRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/admin', onlineUsersRoutes);
app.use("/api/logs", logsRoutes);

/* =====================================================
   📂 6. ARCHIVOS ESTÁTICOS
===================================================== */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* =====================================================
   🌱 7. RUTAS BÁSICAS
===================================================== */
app.get('/', (_req, res) => res.send('Backend Diario Virtual funcionando 👌'));
app.get('/test', (_req, res) => res.json({ message: 'Test OK' }));

/* =====================================================
   🧯 8. MANEJO GLOBAL DE ERRORES
===================================================== */
app.use(errorHandler);

export default app;