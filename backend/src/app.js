// src/app.js - CON RATE LIMITING PARA LOGIN
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
app.set('trust proxy', 1);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  'https://gestor-independiente.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174','https://gestor-independiente.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'], 
  optionsSuccessStatus: 200
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: 'Demasiados intentos de login. Por seguridad, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

app.use('/api/auth/login', loginLimiter); 
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

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (_req, res) => res.send('Backend Diario Virtual funcionando 👌'));
app.get('/test', (req, res) => res.json({ message: 'Test OK' }));

app.use(errorHandler);



export default app;
