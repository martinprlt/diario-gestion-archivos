// 📁 src/config/multer-fotos.js - ACTUALIZADO PARA CLOUDINARY
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_PATH } from './multer.js';

// ✅ Crear carpeta temporal para fotos (solo para procesamiento antes de Cloudinary)
const fotosTempPath = path.join(UPLOADS_PATH, 'temp-fotos');
if (!fs.existsSync(fotosTempPath)) {
  fs.mkdirSync(fotosTempPath, { recursive: true });
  console.log('📁 Carpeta temporal para fotos creada:', fotosTempPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fotosTempPath); // ⬅️ Carpeta TEMPORAL para procesamiento
  },
  filename: (req, file, cb) => {
    const fileHash = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileExt = path.extname(file.originalname);
    cb(null, `${fileHash}${fileExt}`);
  }
});

export const uploadFoto = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB para imágenes
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, GIF, WEBP, SVG)'), false);
    }
  }
});