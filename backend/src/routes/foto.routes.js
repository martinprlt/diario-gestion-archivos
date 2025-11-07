// 📁 backend/src/routes/foto.routes.js - VERSIÓN FINAL

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
} from '../controllers/foto.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadFoto as uploadMiddleware } from '../config/multer-fotos.js';
import multer from 'multer';

const router = express.Router();

// Middleware para errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'Imagen demasiado grande. Máximo permitido: 20MB.' 
      });
    }
    return res.status(400).json({ 
      success: false,
      message: `Error de Multer: ${err.message}` 
    });
  }
  
  if (err.message.includes('permiten imágenes')) {
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  
  next(err);
};

// Rutas de galería global (ANTES de /:id)
router.get('/global', getFotosGlobales);
router.get('/globales', getFotosGlobales);

// Rutas de descarga/visualización (ANTES de /:id)
router.get('/download/:id', verifyToken, downloadFoto);
router.get('/view/:id', verifyToken, viewFoto);

// Rutas personales
router.get('/my', verifyToken, getMyFotos);

// Ruta de upload
router.post('/upload', 
  verifyToken,
  uploadMiddleware.single('archivo'),
  handleMulterError,
  uploadFoto
);

// Otras rutas específicas (ANTES de /:id)
router.put('/:id/toggle-visibility', verifyToken, toggleVisibilidadFoto);
router.delete('/:id', verifyToken, deleteFoto);

// Ruta genérica al final
router.get('/:id', verifyToken, getFotoById);

export default router;