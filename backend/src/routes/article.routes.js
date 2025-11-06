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

//Rutas globales
router.get('/categorias', verifyToken, getCategorias);
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
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);
router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);
export default router;
