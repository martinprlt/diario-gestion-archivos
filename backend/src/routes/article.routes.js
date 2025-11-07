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

// ⚠️ CRÍTICO: RUTAS ESPECÍFICAS PRIMERO (antes de /:id)

// Rutas globales
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/my/:estado', verifyToken, getArticlesByEstado);
router.get('/', getArticulosFiltrados);

// ✅ RUTAS DE DESCARGA/VISUALIZACIÓN (ANTES DE /:id)
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// Rutas para periodistas
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);
router.get('/my', verifyToken, getMyArticles);
router.post('/:id/send-to-review', verifyToken, sendToReview);

// Rutas para editores (también deben ir antes de /:id)
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// ✅ RUTAS GENÉRICAS AL FINAL
router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;