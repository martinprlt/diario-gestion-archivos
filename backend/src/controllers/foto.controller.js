// src/controllers/foto.controller.js - CON CLOUDINARY
import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { logAction } from "../helpers/logAction.js";

// =============================
// SUBIR FOTO A CLOUDINARY
// =============================
export const uploadFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    const { titulo, descripcion, categoria_id, evento_id, es_global } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: "Faltan campos obligatorios (título)" });
    }

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
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
        cloudinary_url, cloudinary_public_id, tamaño_archivo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      titulo.trim(),
      descripcion || '',
      req.userId,
      categoria_id ? Number(categoria_id) : null,
      evento_id ? Number(evento_id) : null,
      req.file.mimetype,
      now,
      es_global === 'true' || es_global === true,
      req.file.path, // Guardar ruta temporal
      req.file.originalname,
      uploadResult.secure_url, // URL permanente de Cloudinary
      uploadResult.public_id,  // ID para gestión en Cloudinary
      uploadResult.bytes       // Tamaño del archivo
    ];

    const result = await pool.query(query, values);

    // Limpiar archivo local temporal
    try {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.warn("⚠️ No se pudo eliminar archivo temporal:", error.message);
    }

    console.log("✅ Foto subida a Cloudinary con éxito");

    res.status(201).json(result.rows[0]);

    await logAction({
      usuario_id: req.userId,
      accion: 'crear',
      descripcion: `Subió foto "${titulo}" a Cloudinary${categoria_id ? ` en categoría ${categoria_id}` : ''}${es_global ? ' (global)' : ' (personal)'}`
    });

  } catch (error) {
    console.error("❌ Error en uploadFoto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER MIS FOTOS (Galería personal)
// =============================
export const getMyFotos = async (req, res) => {
  try {
    const fotografo_id = req.userId;
    
    const result = await pool.query(
      `SELECT f.*, c.nombre as categoria_nombre 
       FROM fotos f 
       LEFT JOIN categorias c ON f.categoria_id = c.id_categoria
       WHERE f.fotografo_id = $1
       ORDER BY f.fecha DESC`,
      [fotografo_id]
    );
    
    // Usar cloudinary_url en lugar de construir URL local
    const fotosConUrl = result.rows.map(foto => ({
      ...foto,
      url: foto.cloudinary_url || `${req.protocol}://${req.get('host')}/${foto.ruta_archivo}`
    }));

    res.json(fotosConUrl);
  } catch (error) {
    console.error("❌ Error al obtener fotos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER FOTOS GLOBALES (Para periodistas)
// =============================
export const getFotosGlobales = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, 
              u.nombre AS fotografo_nombre, 
              u.apellido AS fotografo_apellido,
              c.nombre AS categoria_nombre 
       FROM fotos f 
       LEFT JOIN usuarios u ON f.fotografo_id = u.id_usuario
       LEFT JOIN categorias c ON f.categoria_id = c.id_categoria
       WHERE f.es_global = true
       ORDER BY f.fecha DESC`
    );

    // Usar cloudinary_url para todas las fotos
    const fotosConUrl = result.rows.map(foto => ({
      ...foto,
      url: foto.cloudinary_url || `${req.protocol}://${req.get('host')}/${foto.ruta_archivo}`,
    }));

    res.json(fotosConUrl);
  } catch (error) {
    console.error("❌ Error al obtener fotos globales:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// CAMBIAR VISIBILIDAD (Personal ↔ Global)
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
      return res.status(404).json({ message: "Foto no encontrada o no autorizada" });
    }

    const foto = fotoCheck.rows[0];
    
    await pool.query(
      `UPDATE fotos 
       SET es_global = $1, fecha = $2
       WHERE id_foto = $3`,
      [!foto.es_global, new Date(), id]
    );

    res.json({ 
      success: true, 
      message: `Foto ${!foto.es_global ? 'compartida globalmente' : 'movida a galería personal'}`,
      es_global: !foto.es_global
    });

    await logAction({
      usuario_id: userId,
      accion: 'actualizar',
      descripcion: `Cambió visibilidad de foto ID ${id} a ${!foto.es_global ? 'global' : 'personal'}`
    });

  } catch (error) {
    console.error("❌ Error al cambiar visibilidad:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ELIMINAR FOTO (CON CLOUDINARY)
// =============================
export const deleteFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, user } = req;

    let fotoCheck;

    // Si es admin, puede borrar cualquier foto. Si no, solo las suyas.
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
      return res.status(404).json({ message: "Foto no encontrada o no tienes permiso para eliminarla" });
    }

    const foto = fotoCheck.rows[0];
    
    // Eliminar archivo de Cloudinary si existe
    if (foto.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(foto.cloudinary_public_id);
        console.log("✅ Foto eliminada de Cloudinary:", foto.cloudinary_public_id);
      } catch (error) {
        console.warn("⚠️ No se pudo eliminar foto de Cloudinary:", error.message);
      }
    }

    // Eliminar archivo físico local si existe
    try {
      const fs = await import('fs');
      if (fs.existsSync(foto.ruta_archivo)) {
        fs.unlinkSync(foto.ruta_archivo);
        console.log("🗑️ Archivo local eliminado:", foto.ruta_archivo);
      }
    } catch (error) {
      console.warn("⚠️ No se pudo eliminar el archivo físico:", error.message);
    }

    // Eliminar de la base de datos
    await pool.query(`DELETE FROM fotos WHERE id_foto = $1`, [id]);

    res.json({ success: true, message: "Foto eliminada correctamente" });

    await logAction({
      usuario_id: userId,
      accion: 'eliminar',
      descripcion: `Eliminó foto ID ${id} ("${foto.titulo}") de Cloudinary`
    });

  } catch (error) {
    console.error("❌ Error al eliminar foto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER FOTO POR ID
// =============================
export const getFotoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT f.*, 
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
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const foto = result.rows[0];
    const fotoConUrl = {
      ...foto,
      url: foto.cloudinary_url || `${req.protocol}://${req.get('host')}/${foto.ruta_archivo}`
    };

    res.json(fotoConUrl);
  } catch (error) {
    console.error("❌ Error al obtener foto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// DESCARGAR FOTO DESDE CLOUDINARY
// =============================
export const downloadFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT cloudinary_url, nombre_original, tipo_archivo 
       FROM fotos WHERE id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const { cloudinary_url, nombre_original, tipo_archivo } = result.rows[0];

    if (!cloudinary_url) {
      return res.status(404).json({ message: "Foto no disponible en Cloudinary" });
    }

    // ✅ CORREGIDO: Enviar JSON, NO redirigir
    res.json({
      success: true,
      downloadUrl: cloudinary_url,
      filename: nombre_original,
      fileType: nombre_original.split('.').pop()?.toLowerCase() || tipo_archivo
    });

    await logAction({
      usuario_id: req.userId,
      accion: 'descargar',
      descripcion: `Solicitó descarga de foto ID ${id} (${nombre_original})`
    });

  } catch (error) {
    console.error("❌ Error al descargar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// VER FOTO DESDE CLOUDINARY
// =============================
export const viewFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT cloudinary_url, nombre_original, tipo_archivo 
       FROM fotos WHERE id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const { cloudinary_url, nombre_original, tipo_archivo } = result.rows[0];

    if (!cloudinary_url) {
      return res.status(404).json({ message: "Foto no disponible en Cloudinary" });
    }

    // ✅ CORREGIDO: Enviar JSON, NO redirigir
    res.json({
      success: true,
      viewUrl: cloudinary_url,
      filename: nombre_original,
      fileType: nombre_original.split('.').pop()?.toLowerCase() || tipo_archivo
    });

    await logAction({
      usuario_id: req.userId,
      accion: 'visualizar',
      descripcion: `Solicitó visualización de foto ID ${id} (${nombre_original})`
    });

  } catch (error) {
    console.error("❌ Error al visualizar foto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
// =============================
// OBTENER FOTOS FILTRADAS
// =============================
export const getFotosFiltradas = async (req, res) => {
  const { categoria } = req.query;
  
  try {
    let query = `
      SELECT 
        f.*, 
        c.nombre as categoria_nombre,
        u.nombre as fotografo_nombre, 
        u.apellido as fotografo_apellido,
        u.usuario as fotografo_usuario
      FROM fotos f
      JOIN categorias c ON f.categoria_id = c.id_categoria
      JOIN usuarios u ON f.fotografo_id = u.id_usuario
      WHERE f.es_global = true
    `;
    
    const params = [];
    
    if (categoria) {
      params.push(parseInt(categoria));
      query += ` AND f.categoria_id = $${params.length}`;
    }
    
    query += ` ORDER BY f.fecha DESC`;
    
    const result = await pool.query(query, params);
    
    // Usar cloudinary_url para todas las fotos
    const fotosConUrl = result.rows.map(foto => ({
      ...foto,
      url: foto.cloudinary_url || `${req.protocol}://${req.get('host')}/${foto.ruta_archivo}`
    }));

    res.json(fotosConUrl);
  } catch (error) {
    console.error('❌ Error al obtener fotos filtradas:', error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
};

// =============================
// ACTUALIZAR FOTO (METADATOS)
// =============================
export const updateFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { titulo, descripcion, categoria_id } = req.body;

    const fotoCheck = await pool.query(
      "SELECT * FROM fotos WHERE id_foto = $1 AND fotografo_id = $2",
      [id, userId]
    );

    if (fotoCheck.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada o no autorizada" });
    }

    const updateQuery = `
      UPDATE fotos 
      SET titulo = $1, descripcion = $2, categoria_id = $3, fecha = $4
      WHERE id_foto = $5
      RETURNING *
    `;

    const values = [
      titulo,
      descripcion,
      categoria_id,
      new Date(),
      id
    ];

    const result = await pool.query(updateQuery, values);
    res.json(result.rows[0]);

    await logAction({
      usuario_id: req.userId,
      accion: 'actualizar',
      descripcion: `Actualizó metadatos de foto ID ${id}`
    });

  } catch (error) {
    console.error("❌ Error al actualizar foto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};