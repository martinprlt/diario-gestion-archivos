// src/routes/foto.routes.js - RUTAS CORREGIDAS
import express from 'express';
import {
  uploadFoto,
  getMyFotos,
  getFotosGlobales,
  getFotoById,
  toggleVisibilidadFoto,
  deleteFoto,
  downloadFoto,
  viewFoto,
  getFotosFiltradas,
} from '../controllers/foto.controller.js';
import { verifyToken, checkAdminRole } from '../middlewares/auth.middleware.js';
import { uploadFoto as uploadMiddleware } from '../config/multer-fotos.js';

const router = express.Router();

// ==================== RUTAS ESPECÍFICAS PRIMERO ====================

// ✅ Rutas de galería global (ANTES de /:id)
router.get('/global', getFotosGlobales);
router.get('/globales', getFotosGlobales); // Alias por si acaso

// Rutas de descarga/visualización (ANTES de /:id)
router.get('/download/:id', verifyToken, downloadFoto);
router.get('/view/:id', verifyToken, viewFoto);

// Rutas personales
router.get('/my', verifyToken, getMyFotos);

// Rutas de acciones
router.post('/upload', verifyToken, uploadMiddleware.single('archivo'), uploadFoto);
router.put('/:id/toggle-visibility', verifyToken, toggleVisibilidadFoto);
router.delete('/:id', verifyToken, deleteFoto);

// ==================== RUTAS GENÉRICAS AL FINAL ====================
router.get('/:id', verifyToken, getFotoById);

export default router;