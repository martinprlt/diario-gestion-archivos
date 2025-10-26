//src/routes/article.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadArticle,
  getMyArticles,
  getArticleById,
  updateArticle,
  downloadArticle,
  viewArticle,
  deleteArticle,
  sendToReview,
  getArticlesForReview,
  approveArticle,
  rejectArticle,
  getArticlesByEstado,
  getCategorias,
  getNotificacionesUsuario,
  getArticulosFiltrados,
} from '../controllers/file.controllers.js'; // Asegurate de usar un solo archivo de controller
import { verifyToken } from '../middlewares/auth.middleware.js'; // Usamos verifyToken como principal

const router = express.Router();

// Configuración de multer (fusionando la lógica)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Prioridad al primer código: carpeta específica para artículos
    cb(null, 'uploads/articles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Mantener el prefijo del segundo código si existe el fieldname
    cb(null, (file.fieldname ? file.fieldname + '-' : '') + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // límite 10MB
});
//Rutas globales
router.get('/categorias',verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/my/:estado', verifyToken, getArticlesByEstado);
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);
router.get('/', getArticulosFiltrados);

// Rutas para periodistas (primer código manda)
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);
router.get('/my', verifyToken, getMyArticles);
router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);

router.delete('/:id', verifyToken, deleteArticle);
router.post('/:id/send-to-review', verifyToken, sendToReview);

// Rutas para editores
router.get('/editor/review', verifyToken, getArticlesForReview);
router.post('/:id/approve', verifyToken, approveArticle);
router.post('/:id/reject', verifyToken, rejectArticle);
export default router;
