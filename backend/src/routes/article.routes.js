// src/routes/article.routes.js - VERSIÓN COMPLETAMENTE CORREGIDA
import express from 'express';
import {
  uploadArticle,
  getMyArticles,
  getArticleById,
  updateArticle,
  downloadArticle,        // ✅ Asegúrate que esté importado
  viewArticle,            // ✅ Asegúrate que esté importado
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
} from '../controllers/file.controllers.js'; // ✅ .controller.js NO .controllers.js
import { verifyToken, checkEditorRole } from '../middlewares/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// ==================== RUTAS ESPECÍFICAS PRIMERO ====================

// Rutas globales
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/my/:estado', verifyToken, getArticlesByEstado);
router.get('/', getArticulosFiltrados);

// ✅✅✅ RUTAS DE ARCHIVOS PRIMERO (CRÍTICO) ✅✅✅
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// Rutas para periodistas
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);
router.get('/my', verifyToken, getMyArticles);
router.post('/:id/send-to-review', verifyToken, sendToReview);

// Rutas para editores
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// ==================== RUTAS GENÉRICAS AL FINAL ====================
router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;