//src/routes/article.routes.js
import express from 'express';
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
  getApprovedArticles,
} from '../controllers/file.controllers.js';
import { verifyToken, checkEditorRole } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// ✅ 1. RUTAS MÁS ESPECÍFICAS PRIMERO (orden correcto)
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);

// ✅ 2. RUTAS CON ESTADOS ESPECÍFICOS
router.get('/my/estado/:estado', verifyToken, getArticlesByEstado); // ← CAMBIADO
router.get('/my', verifyToken, getMyArticles);

// ✅ 3. RUTAS DE DESCARGA Y VISTA
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// ✅ 4. RUTAS DE ACCIONES
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);
router.post('/:id/send-to-review', verifyToken, sendToReview);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// ✅ 5. RUTAS DE ACTUALIZACIÓN Y ELIMINACIÓN
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

// ✅ 6. RUTAS CON ID (van después de las específicas)
router.get('/:id', verifyToken, getArticleById);

// ✅ 7. RUTA ROOT AL FINAL (filtros globales)
router.get('/', getArticulosFiltrados); // ← Esta debe ir AL FINAL

export default router;