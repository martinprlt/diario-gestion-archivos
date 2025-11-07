// 📁 backend/src/controllers/foto.controller.js - VERSIÓN FINAL PARA RAILWAY

import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { logAction } from "../helpers/logAction.js";

export const uploadFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No se subió ninguna imagen" 
      });
    }

    const { titulo, descripcion, categoria_id, evento_id, es_global } = req.body;

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: "El título es obligatorio" 
      });
    }

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "fotos",
      use_filename: true,
      unique_filename: true,
      quality: "auto:good"
    });

    const now = new Date();
    
    const query = `
      INSERT INTO fotos (
        titulo, descripcion, fotografo_id, categoria_id, evento_id,
        tipo_archivo, fecha, es_global, ruta_archivo, nombre_original,
        nombre_archivo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      titulo.trim(),
      descripcion?.trim() || '',
      req.userId,
      categoria_id ? Number(categoria_id) : null,
      evento_id ? Number(evento_id) : null,
      req.file.mimetype,
      now,
      es_global === 'true' || es_global === true,
      uploadResult.secure_url,        // URL de Cloudinary
      req.file.originalname,
      uploadResult.public_id          // Para eliminar después
    ];

    const result = await pool.query(query, values);

    // Limpiar archivo temporal
    try {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      // Silenciar error de limpieza
    }

    // Log de auditoría
    await logAction({
      usuario_id: req.userId,
      accion: 'crear',
      descripcion: `Subió foto "${titulo}" (ID: ${result.rows[0].id_foto})`
    });

    res.status(201).json({
      success: true,
      foto: result.rows[0],
      message: "Foto subida correctamente"
    });

  } catch (error) {
    console.error("❌ Error en uploadFoto:", error.message);
    
    // Limpiar archivo temporal en caso de error
    if (req.file?.path) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        // Silenciar
      }
    }

    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// =============================
// OBTENER MIS FOTOS
// =============================
export const getMyFotos = async (req, res) => {
  try {
    const fotografo_id = req.userId;
    
    const result = await pool.query(
      `SELECT 
        f.*,
        c.nombre as categoria_nombre 
       FROM fotos f 
       LEFT JOIN categorias c ON f.categoria_id = c.id_categoria
       WHERE f.fotografo_id = $1
       ORDER BY f.fecha DESC`,
      [fotografo_id]
    );
    
    const fotosConUrl = result.rows.map(foto => ({
      ...foto,
      url: foto.ruta_archivo
    }));

    res.json(fotosConUrl);
  } catch (error) {
    console.error("❌ Error al obtener fotos personales:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener fotos personales" 
    });
  }
};

// =============================
// OBTENER FOTOS GLOBALES
// =============================
export const getFotosGlobales = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        f.*, 
        u.nombre AS fotografo_nombre, 
        u.apellido AS fotografo_apellido,
        c.nombre AS categoria_nombre 
       FROM fotos f 
       LEFT JOIN usuarios u ON f.fotografo_id = u.id_usuario
       LEFT JOIN categorias c ON f.categoria_id = c.id_categoria
       WHERE f.es_global = true
       ORDER BY f.fecha DESC`
    );

    const fotosConUrl = result.rows.map(foto => ({
      ...foto,
      url: foto.ruta_archivo,
      fotografo_nombre_completo: `${foto.fotografo_nombre || ''} ${foto.fotografo_apellido || ''}`.trim()
    }));

    res.json(fotosConUrl);
  } catch (error) {
    console.error("❌ Error al obtener fotos globales:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener fotos globales" 
    });
  }
};

// =============================
// CAMBIAR VISIBILIDAD
// =============================
export const toggleVisibilidadFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const fotoCheck = await pool.query(
      `SELECT * FROM fotos WHERE id_foto = $1 AND fotografo_id = $2`,
      [id, userId]
    );

    if (fotoCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no encontrada o no autorizada" 
      });
    }

    const foto = fotoCheck.rows[0];
    const nuevoEstado = !foto.es_global;
    
    await pool.query(
      `UPDATE fotos 
       SET es_global = $1, fecha = $2
       WHERE id_foto = $3`,
      [nuevoEstado, new Date(), id]
    );

    await logAction({
      usuario_id: userId,
      accion: 'actualizar',
      descripcion: `Cambió visibilidad de foto ID ${id} a ${nuevoEstado ? 'global' : 'personal'}`
    });

    res.json({ 
      success: true, 
      message: nuevoEstado 
        ? 'Foto compartida en galería global' 
        : 'Foto movida a galería personal',
      es_global: nuevoEstado
    });

  } catch (error) {
    console.error("❌ Error al cambiar visibilidad:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al cambiar visibilidad" 
    });
  }
};

// =============================
// ELIMINAR FOTO
// =============================
export const deleteFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, user } = req;

    let fotoCheck;

    if (user.categoria === 'administrador' || user.categoria === 'admin') {
      fotoCheck = await pool.query(
        `SELECT * FROM fotos WHERE id_foto = $1`,
        [id]
      );
    } else {
      fotoCheck = await pool.query(
        `SELECT * FROM fotos WHERE id_foto = $1 AND fotografo_id = $2`,
        [id, userId]
      );
    }

    if (fotoCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no encontrada o sin permisos" 
      });
    }

    const foto = fotoCheck.rows[0];
    
    // Eliminar de Cloudinary
    if (foto.nombre_archivo) {
      try {
        await cloudinary.uploader.destroy(foto.nombre_archivo);
      } catch (error) {
        console.warn("⚠️ No se pudo eliminar de Cloudinary:", error.message);
      }
    }

    // Eliminar de la BD
    await pool.query(`DELETE FROM fotos WHERE id_foto = $1`, [id]);

    await logAction({
      usuario_id: userId,
      accion: 'eliminar',
      descripcion: `Eliminó foto "${foto.titulo}" (ID: ${id})`
    });

    res.json({ 
      success: true, 
      message: "Foto eliminada correctamente" 
    });

  } catch (error) {
    console.error("❌ Error al eliminar foto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar foto" 
    });
  }
};

// =============================
// OBTENER FOTO POR ID
// =============================
export const getFotoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        f.*, 
        u.nombre as fotografo_nombre, 
        u.apellido as fotografo_apellido,
        c.nombre as categoria_nombre 
       FROM fotos f 
       LEFT JOIN usuarios u ON f.fotografo_id = u.id_usuario
       LEFT JOIN categorias c ON f.categoria_id = c.id_categoria
       WHERE f.id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no encontrada" 
      });
    }

    const foto = result.rows[0];
    const fotoConUrl = {
      ...foto,
      url: foto.ruta_archivo,
      fotografo_nombre_completo: `${foto.fotografo_nombre || ''} ${foto.fotografo_apellido || ''}`.trim()
    };

    res.json(fotoConUrl);
  } catch (error) {
    console.error("❌ Error al obtener foto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener foto" 
    });
  }
};

// =============================
// DESCARGAR/VER FOTO
// =============================
export const downloadFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ruta_archivo, nombre_original, tipo_archivo 
       FROM fotos WHERE id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no encontrada" 
      });
    }

    const { ruta_archivo, nombre_original, tipo_archivo } = result.rows[0];

    if (!ruta_archivo) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no disponible" 
      });
    }

    await logAction({
      usuario_id: req.userId,
      accion: 'descargar',
      descripcion: `Descargó foto ID ${id}`
    });

    res.json({
      success: true,
      downloadUrl: ruta_archivo,
      filename: nombre_original,
      fileType: nombre_original.split('.').pop()?.toLowerCase() || tipo_archivo
    });

  } catch (error) {
    console.error("❌ Error al descargar:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al descargar foto" 
    });
  }
};

export const viewFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ruta_archivo, nombre_original, tipo_archivo 
       FROM fotos WHERE id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no encontrada" 
      });
    }

    const { ruta_archivo, nombre_original, tipo_archivo } = result.rows[0];

    if (!ruta_archivo) {
      return res.status(404).json({ 
        success: false,
        message: "Foto no disponible" 
      });
    }

    res.json({
      success: true,
      viewUrl: ruta_archivo,
      filename: nombre_original,
      fileType: nombre_original.split('.').pop()?.toLowerCase() || tipo_archivo
    });

  } catch (error) {
    console.error("❌ Error al visualizar:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al visualizar foto" 
    });
  }
};