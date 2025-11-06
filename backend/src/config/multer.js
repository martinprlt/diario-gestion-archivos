//src/config/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- RUTA DE SUBIDA CENTRALIZADA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Apunta a la carpeta `backend/uploads`
export const UPLOADS_PATH = path.resolve(__dirname, '../..', 'uploads');

const ensureUploadsDir = (subfolder) => {
  const fullPath = path.join(UPLOADS_PATH, subfolder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Directorio de subida asegurado: ${fullPath}`);
  }
  return fullPath;
};

// ✅ Validación de extensiones permitidas
const isValidExtension = (filename, allowedExtensions) => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

// Configuración para artículos
const articlesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
  const userId = req.userId; // 🔹 usamos solo userId
  if (!userId) {
    return cb(new Error('No se pudo identificar al usuario para guardar el archivo.'));
  }

  // 📁 Cada usuario tendrá su propia carpeta: uploads/articles/<userId>
  const userFolderPath = path.join('articles', String(userId));
  cb(null, ensureUploadsDir(userFolderPath));
},
  filename: (req, file, cb) => {
    // ✅ Sanitizar el nombre original (quitar caracteres peligrosos)
    const sanitizedOriginal = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 50); // Limitar longitud
    
    const ext = path.extname(sanitizedOriginal);
    const nameWithoutExt = path.basename(sanitizedOriginal, ext);
    const uniqueName = `${Date.now()}-${nameWithoutExt}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    
    cb(null, uniqueName);
  }
});

// Configuración para avatares
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadsDir('avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});

// ✅ Configuración para artículos con validación dual (MIME + extensión)
export const upload = multer({
  storage: articlesStorage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Máximo 10 archivos a la vez
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf',
      'text/plain'
    ];
    
    const allowedExtensions = ['.doc', '.docx', '.pdf', '.txt'];
    
    // ✅ Validar MIME type Y extensión (doble verificación)
    const isValidMime = allowedMimeTypes.includes(file.mimetype);
    const isValidExt = isValidExtension(file.originalname, allowedExtensions);
    
    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error(`Solo documentos permitidos (.doc, .docx, .pdf, .txt). Recibido: ${file.originalname}`));
    }
  }
});

// ✅ Configuración para avatares con validación dual
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1 // Solo 1 avatar a la vez
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const isValidMime = allowedMimeTypes.includes(file.mimetype);
    const isValidExt = isValidExtension(file.originalname, allowedExtensions);
    
    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error(`Solo imágenes permitidas (.jpg, .png, .gif, .webp). Recibido: ${file.originalname}`));
    }
  }
});

// ✅ Middleware para manejar errores de Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Archivo demasiado grande. Máximo permitido: 50MB para documentos, 2MB para avatares.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Demasiados archivos. Máximo: 10 documentos o 1 avatar.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Campo de archivo inesperado.' 
      });
    }
  }
  
  // Error personalizado del fileFilter
  if (err.message.includes('permitido')) {
    return res.status(400).json({ message: err.message });
  }
  
  next(err);
};
