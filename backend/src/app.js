// backend/src/app.js - ORDEN CORRECTO DE RUTAS
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar TODAS las rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import articleRoutes from './routes/article.routes.js';
import fotoRoutes from './routes/foto.routes.js';
import categoriaRoutes from './routes/categoria.routes.js'; // ⬅️ IMPORTANTE
import onlineUsersRoutes from './routes/onlineUsers.routes.js';
import fileRoutes from './routes/file.routes.js';
import logsRoutes from "./routes/logs.routes.js";
import errorHandler from './middlewares/error.middleware.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* =====================================================
   🌐 0. TRUST PROXY
===================================================== */
app.set('trust proxy', 1);

/* =====================================================
   🌐 1. CORS
===================================================== */
const cleanUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return url.replace(/\/+$/, '');
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  cleanUrl(process.env.FRONTEND_URL),
  'https://sgdi-independiente.up.railway.app'
].filter(Boolean);

console.log('🔄 Orígenes CORS permitidos:');
allowedOrigins.forEach(origin => console.log(`   ✓ ${origin}`));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = cleanUrl(origin);
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado:', cleanOrigin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

/* =====================================================
   🧩 MIDDLEWARES BÁSICOS
===================================================== */
app.use(express.json());

/* =====================================================
   🛣️ RUTAS DEL SISTEMA - ORDEN CRÍTICO
===================================================== */

// 1. Autenticación (SIN rate limiter aquí, está en auth.routes.js)
app.use('/api/auth', authRoutes);

// 2. Usuarios y roles
app.use('/api', userRoutes);
app.use('/api', rolesRoutes);

// 3. Categorías - ✅ ANTES de artículos
app.use('/api/categorias', categoriaRoutes); // ⬅️ CRÍTICO: Debe estar aquí

// 4. Artículos (depende de categorías)
app.use('/api/articles', articleRoutes);

// 5. Fotos
app.use('/api/fotos', fotoRoutes);

// 6. Notificaciones
app.use("/api/notificaciones", notificacionesRoutes);

// 7. Archivos y avatares
app.use('/api', fileRoutes);

// 8. Admin
app.use('/api/admin', onlineUsersRoutes);
app.use("/api/logs", logsRoutes);

/* =====================================================
   📂 ARCHIVOS ESTÁTICOS
===================================================== */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* =====================================================
   🌱 RUTAS BÁSICAS
===================================================== */
app.get('/', (_req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend Diario Virtual funcionando 👌',
    endpoints: {
      auth: '/api/auth',
      users: '/api/usuarios',
      articles: '/api/articles',
      categories: '/api/categorias', // ⬅️ Confirmar ruta
      photos: '/api/fotos',
      notifications: '/api/notificaciones',
      logs: '/api/logs'
    }
  });
});

app.get('/test', (_req, res) => res.json({ message: 'Test OK' }));

// ✅ AGREGAR: Endpoint de debug para categorías
app.get('/api/test-categorias', async (_req, res) => {
  try {
    const { pool } = await import('./config/db.js');
    const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json({
      success: true,
      count: result.rows.length,
      categorias: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =====================================================
   🧯 MANEJO GLOBAL DE ERRORES
===================================================== */
app.use(errorHandler);

export default app;