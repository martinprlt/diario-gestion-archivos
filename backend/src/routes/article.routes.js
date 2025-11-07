// src/routes/article.routes.js - ORDEN CRÍTICO CORREGIDO
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

// ========================================
// ⚠️ ORDEN CRÍTICO: RUTAS ESPECÍFICAS PRIMERO
// ========================================

// 1️⃣ Rutas sin parámetros (globales)
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/', getArticulosFiltrados);

// 2️⃣ Rutas de periodistas (ANTES de /my/:estado)
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle); // ✅ UPLOAD PRIMERO
router.get('/my', verifyToken, getMyArticles);

// 3️⃣ Rutas de editores (ANTES de /:id)
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);

// 4️⃣ Rutas de descarga/visualización (ANTES de /:id)
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// 5️⃣ Rutas con parámetros específicos (ANTES de /:id genérico)
router.get('/my/:estado', verifyToken, getArticlesByEstado); // ✅ DESPUÉS de /my
router.post('/:id/send-to-review', verifyToken, sendToReview);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// 6️⃣ ⚠️ RUTAS GENÉRICAS AL FINAL (estas capturan cualquier cosa)
router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;