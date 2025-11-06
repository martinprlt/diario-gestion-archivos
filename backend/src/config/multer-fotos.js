import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_PATH } from './multer.js'; // Importar la ruta centralizada

// Asegurarse de que el subdirectorio 'fotos' exista
const fotosUploadPath = path.join(UPLOADS_PATH, 'fotos');
if (!fs.existsSync(fotosUploadPath)) {
  fs.mkdirSync(fotosUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fotosUploadPath); // Usar la ruta absoluta y asegurada
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
