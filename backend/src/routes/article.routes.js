// backend/src/routes/article.routes.js - VERSIÓN LIMPIA
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

// Rutas globales sin parámetros
router.get('/categorias', verifyToken, getCategorias);
router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
router.get('/', getArticulosFiltrados);

// Upload - debe ser antes de rutas con parámetros
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);

// Rutas de periodistas
router.get('/my', verifyToken, getMyArticles);

// Rutas de editores
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);

// Rutas de descarga/visualización
router.get('/download/:id', verifyToken, downloadArticle);
router.get('/view/:id', verifyToken, viewArticle);

// Rutas con parámetros específicos
router.get('/my/:estado', verifyToken, getArticlesByEstado);
router.post('/:id/send-to-review', verifyToken, sendToReview);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);

// Rutas genéricas al final
router.get('/:id', verifyToken, getArticleById);
router.put('/:id', verifyToken, updateArticle);
router.delete('/:id', verifyToken, deleteArticle);

export default router;