// backend/src/routes/article.routes.js - ORDEN CORREGIDO
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

// ==================== RUTAS ESPECÍFICAS PRIMERO ====================

// 1. Rutas globales sin parámetros
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/', getArticulosFiltrados);

// 2. UPLOAD - debe ser antes de rutas con parámetros
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);

// 3. Rutas de periodistas
router.get('/my', verifyToken, getMyArticles);

// 4. Rutas de editores
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);

// 5. Rutas de descarga/visualización
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// 6. Rutas con parámetros específicos
router.get('/my/:estado', verifyToken, getArticlesByEstado);
router.post('/:id/send-to-review', verifyToken, sendToReview);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// ==================== RUTAS GENÉRICAS AL FINAL ====================
// ⚠️ ESTAS DEBEN SER LAS ÚLTIMAS RUTAS

router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;