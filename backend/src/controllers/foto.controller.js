import { pool } from "../config/db.js";
import path from "path";
import fs from "fs";

// =============================
// SUBIR FOTO (Simplificado)
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

    const now = new Date();
    
    // ✅ SOLO las columnas necesarias
    const query = `
      INSERT INTO fotos (
        titulo, descripcion, fotografo_id, categoria_id, evento_id,
        tipo_archivo, fecha, es_global, ruta_archivo, nombre_original
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      req.file.path,          // ruta_archivo (ESENCIAL)
      req.file.originalname   // nombre_original (ÚTIL)
    ];

    const result = await pool.query(query, values);
    console.log("✅ Foto subida con éxito");

    res.status(201).json(result.rows[0]);

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
       ORDER BY f.fecha DESC`, // ← Usa f.fecha en lugar de f.fecha_creacion
      [fotografo_id]
    );
    
    res.json(result.rows);
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
              u.nombre as fotografo_nombre, 
              u.apellido as fotografo_apellido,
              c.nombre as categoria_nombre 
       FROM fotos f 
       LEFT JOIN usuarios u ON f.fotografo_id = u.id_usuario
       LEFT JOIN categorias c ON f.categoria_id = c.id_categoria
       WHERE f.es_global = true
       ORDER BY f.fecha DESC`
    );
    
    res.json(result.rows);
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
    
    // ✅ USAR SOLO COLUMNAS EXISTENTES
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

  } catch (error) {
    console.error("❌ Error al cambiar visibilidad:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ELIMINAR FOTO
// =============================
export const deleteFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verificar que la foto existe y pertenece al usuario
    const fotoCheck = await pool.query(
      `SELECT * FROM fotos WHERE id_foto = $1 AND fotografo_id = $2`,
      [id, userId]
    );

    if (fotoCheck.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada o no autorizada" });
    }

    const foto = fotoCheck.rows[0];
    
    // Eliminar archivo físico
    try {
      if (fs.existsSync(foto.ruta_archivo)) {
        fs.unlinkSync(foto.ruta_archivo);
        console.log("🗑️ Archivo eliminado:", foto.ruta_archivo);
      }
    } catch (error) {
      console.warn("⚠️ No se pudo eliminar el archivo físico:", error.message);
    }

    // Eliminar de la base de datos
    await pool.query(`DELETE FROM fotos WHERE id_foto = $1`, [id]);

    res.json({ success: true, message: "Foto eliminada correctamente" });

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

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener foto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// DESCARGAR FOTO
// =============================
export const downloadFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ruta_archivo, nombre_original 
       FROM fotos WHERE id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const { ruta_archivo, nombre_original } = result.rows[0];

    if (!fs.existsSync(ruta_archivo)) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    res.download(ruta_archivo, nombre_original);

  } catch (error) {
    console.error("❌ Error al descargar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const viewFoto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ruta_archivo, tipo_archivo 
       FROM fotos WHERE id_foto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const { ruta_archivo, tipo_archivo } = result.rows[0];

    if (!fs.existsSync(ruta_archivo)) {
      return res.status(404).json({ message: "Archivo no encontrado en el servidor" });
    }

    // Enviar la imagen directamente
    res.setHeader('Content-Type', tipo_archivo);
    res.sendFile(path.resolve(ruta_archivo));

  } catch (error) {
    console.error("❌ Error al visualizar foto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

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
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener fotos filtradas:', error);
    res.status(500).json({ message: "Error al obtener fotos" });
  }
};