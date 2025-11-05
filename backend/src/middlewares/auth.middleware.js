// 📁 middlewares/auth.middleware.js - COMPLETO
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'un_secreto_muy_seguro_para_jwt';

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;

    // 🔹 Obtener datos del usuario CON SU ROL
    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.usuario, u.email, r.nombre as categoria
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id_rol
       WHERE u.id_usuario = $1`,
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no existe" });
    }

    const user = rows[0];
    
    req.user = { 
      id: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      email: user.email,
      categoria: user.categoria.toLowerCase()
    };

    console.log(`Token válido: ${req.user.usuario} (${req.user.categoria})`);
    next();

  } catch (err) {
    console.error("Error en verifyToken:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Sesión expirada. Por favor inicia sesión nuevamente.",
        error: 'jwt expired'
      });
    }
    
    return res.status(401).json({
      message: "Token inválido",
      error: err.message,
    });
  }
}

export async function checkAdminRole(req, res, next) {
  try {
    const categoria = req.user.categoria?.toLowerCase();
    
    if (categoria === 'administrador' || categoria === 'admin') {
      console.log(' Usuario admin verificado:', req.user.usuario);
      return next();
    }

    console.log(' Acceso denegado:', req.user.usuario, 'es', categoria);
    return res.status(403).json({ 
      message: "Acceso denegado: se requiere rol de administrador",
      tuCategoria: req.user.categoria 
    });

  } catch (err) {
    console.error(" Error en checkAdminRole:", err);
    res.status(500).json({ message: "Error al verificar rol" });
  }
}

export async function checkEditorRole(req, res, next) {
  try {
    const categoria = req.user.categoria?.toLowerCase();
    
    if (categoria === 'editor') {
      console.log('Usuario editor verificado:', req.user.usuario);
      return next();
    }

    console.log(' Acceso denegado:', req.user.usuario, 'es', categoria);
    return res.status(403).json({ 
      message: "Acceso denegado: se requiere rol de editor",
      tuCategoria: req.user.categoria 
    });

  } catch (err) {
    console.error(" Error en checkEditorRole:", err);
    res.status(500).json({ message: "Error al verificar rol" });
  }
}

// 🆕 NUEVO: Middleware genérico para múltiples roles
export function checkRole(rolesPermitidos) {
  return (req, res, next) => {
    try {
      const categoria = req.user?.categoria?.toLowerCase();

      if (!categoria) {
        return res.status(403).json({ 
          message: "No se pudo verificar el rol del usuario" 
        });
      }

      // Normalizar roles permitidos
      const rolesNormalizados = rolesPermitidos.map(rol => rol.toLowerCase());
      
      // Verificar si el usuario tiene uno de los roles permitidos
      if (rolesNormalizados.includes(categoria)) {
        console.log(` Rol verificado: ${req.user.usuario} (${categoria})`);
        return next();
      }

      console.log(` Acceso denegado: ${req.user.usuario} es ${categoria}, se requiere: ${rolesPermitidos.join(' o ')}`);
      return res.status(403).json({ 
        message: `Acceso denegado: se requiere rol de ${rolesPermitidos.join(' o ')}`,
        tuCategoria: req.user.categoria,
        rolesRequeridos: rolesPermitidos
      });

    } catch (err) {
      console.error("Error en checkRole:", err);
      res.status(500).json({ message: "Error al verificar permisos" });
    }
  };
}