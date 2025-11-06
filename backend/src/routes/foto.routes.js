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

router.get('/globales', getFotosGlobales);
router.get('/my', verifyToken, getMyFotos);



// Rutas para fotógrafos
router.post('/upload', verifyToken, uploadMiddleware.single('archivo'), uploadFoto);
router.put('/:id/toggle-visibility', verifyToken, toggleVisibilidadFoto);
router.delete('/:id', verifyToken, deleteFoto);
router.get('/view/:id', verifyToken, viewFoto);
router.get('/global', getFotosGlobales);

// Rutas públicas (para periodistas)
router.get('/:id', verifyToken, getFotoById);
router.get('/download/:id', verifyToken, downloadFoto);

export default router;
