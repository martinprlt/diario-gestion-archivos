// 🔍 VERIFICACIÓN: Copia este código COMPLETO en backend/src/routes/article.routes.js
// Este es el orden 100% correcto que debe tener tu archivo

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
// 🚨 ORDEN CRÍTICO - NO CAMBIAR
// ========================================

console.log('📁 Rutas de artículos cargadas en orden:');

// 1. Rutas globales sin parámetros
router.get('/categorias', verifyToken, getCategorias);
console.log('   ✅ GET    /categorias');

router.get('/user/notifications', verifyToken, getNotificacionesUsuario);
console.log('   ✅ GET    /user/notifications');

router.get('/', getArticulosFiltrados);
console.log('   ✅ GET    /');

// 2. UPLOAD - DEBE SER ANTES DE /my/:estado
router.post('/upload', verifyToken, upload.single('archivo'), uploadArticle);
console.log('   ✅ POST   /upload 📤 (CRÍTICO)');

// 3. Rutas de periodistas
router.get('/my', verifyToken, getMyArticles);
console.log('   ✅ GET    /my');

// 4. Rutas de editores
router.get('/editor/review', verifyToken, checkEditorRole, getArticlesForReview);
console.log('   ✅ GET    /editor/review');

router.get('/editor/approved', verifyToken, checkEditorRole, getApprovedArticles);
console.log('   ✅ GET    /editor/approved');

// 5. Rutas de descarga/visualización
router.get('/download/:id', verifyToken, downloadArticle);
console.log('   ✅ GET    /download/:id');

router.get('/view/:id', verifyToken, viewArticle);
console.log('   ✅ GET    /view/:id');

// 6. Rutas con parámetros específicos
router.get('/my/:estado', verifyToken, getArticlesByEstado);
console.log('   ✅ GET    /my/:estado');

router.post('/:id/send-to-review', verifyToken, sendToReview);
console.log('   ✅ POST   /:id/send-to-review');

router.post('/:id/approve', verifyToken, checkEditorRole, approveArticle);
console.log('   ✅ POST   /:id/approve');

router.post('/:id/reject', verifyToken, checkEditorRole, rejectArticle);
console.log('   ✅ POST   /:id/reject');

// 7. ⚠️ Rutas genéricas AL FINAL (capturan cualquier cosa)
router.get('/:id', verifyToken, getArticleById);
console.log('   ⚠️  GET    /:id (genérico - debe estar AL FINAL)');

router.put('/:id', verifyToken, updateArticle);
console.log('   ✅ PUT    /:id');

router.delete('/:id', verifyToken, deleteArticle);
console.log('   ✅ DELETE /:id');

console.log('📁 Total de rutas configuradas: 17');

export default router;