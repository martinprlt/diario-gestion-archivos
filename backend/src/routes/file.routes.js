import express from 'express';
import { uploadAvatar } from '../config/multer.js'; // Asegúrate de que la ruta es correcta
import { pool } from '../config/db.js';
import { verifyToken as authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Esta es tu ruta existente con el mínimo cambio necesario
router.post('/upload-avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó imagen' });
    }

    // Usamos filename directamente (multer ya le da un nombre único)
    const avatarUrl = `/avatars/${req.file.filename}`;

    await pool.query(
      'UPDATE usuarios SET avatar_url = $1 WHERE id_usuario = $2',
      [avatarUrl, userId]
    );

    res.json({ 
      success: true,
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Error subiendo avatar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir imagen' 
    });
  }
});

export default router;