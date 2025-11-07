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

// ⚠️ CRÍTICO: RUTAS ESPECÍFICAS PRIMERO (antes de /:id)

// 1. Rutas globales
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/', getArticulosFiltrados);

// 2. Rutas de descarga/visualización (ANTES de /:id)
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// 3. Rutas de periodistas (ANTES de /:id)
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle); // ✅ ANTES de /:id
router.get('/my', verifyToken, getMyArticles);
router.get('/my/:estado', verifyToken, getArticlesByEstado);
router.post('/:id/send-to-review', verifyToken, sendToReview);

// 4. Rutas para editores (ANTES de /:id)
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// 5. ✅ RUTAS GENÉRICAS AL FINAL
router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;