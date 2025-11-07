// src/controllers/file.controller.js - CON CLOUDINARY
import { pool } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import { logAction } from "../helpers/logAction.js";

// =============================
// SUBIR ARTÍCULO A CLOUDINARY
// =============================
export const uploadArticle = async (req, res) => {
  try {
    const { titulo, categoria_id, articulo_id } = req.body;

    if (!req.file) return res.status(400).json({ message: "No se subió ningún archivo" });
    if (!titulo) return res.status(400).json({ message: "Faltan campos obligatorios (título)" });

    // 🔹 Reemplazo
    if (articulo_id) {
      return await reemplazarArticulo(req, res, articulo_id);
    }

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "articulos",
      use_filename: true,
      unique_filename: true
    });

    const now = new Date();
    let query, values;

    if (categoria_id) {
      const categoriaCheck = await pool.query(
        'SELECT id_categoria FROM categorias WHERE id_categoria = $1',
        [Number(categoria_id)]
      );
      if (categoriaCheck.rows.length === 0) {
        return res.status(400).json({ message: "La categoría seleccionada no existe" });
      }

      query = `INSERT INTO articulos (
        titulo, periodista_id, categoria_id, estado,
        tipo_archivo, nombre_archivo, nombre_original,
        ruta_archivo, tamaño_archivo, fecha_creacion, fecha_modificacion,
        cloudinary_url, cloudinary_public_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *;`;

      values = [
        titulo.trim(), req.userId, Number(categoria_id), 'borrador',
        req.file.mimetype, req.file.filename, req.file.originalname,
        req.file.path, req.file.size, now, now,
        uploadResult.secure_url, uploadResult.public_id
      ];
    } else {
      query = `INSERT INTO articulos (
        titulo, periodista_id, estado,
        tipo_archivo, nombre_archivo, nombre_original,
        ruta_archivo, tamaño_archivo, fecha_creacion, fecha_modificacion,
        cloudinary_url, cloudinary_public_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *;`;

      values = [
        titulo.trim(), req.userId, 'borrador',
        req.file.mimetype, req.file.filename, req.file.originalname,
        req.file.path, req.file.size, now, now,
        uploadResult.secure_url, uploadResult.public_id
      ];
    }

    const result = await pool.query(query, values);

    // Limpiar archivo local temporal
    try {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.warn("⚠️ No se pudo eliminar archivo temporal:", error.message);
    }

    // 🔹 Log
    await logAction({
      usuario_id: req.userId,
      accion: 'crear',
      descripcion: `Creó artículo "${titulo}" en Cloudinary${categoria_id ? ` en categoría ${categoria_id}` : ''}`
    });

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("❌ Error en uploadArticle:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// REEMPLAZAR ARTÍCULO EN CLOUDINARY
// =============================
const reemplazarArticulo = async (req, res, articulo_id) => {
  try {
    const { titulo, categoria_id } = req.body;
    const userId = req.userId;

    const articleCheck = await pool.query(
      `SELECT * FROM articulos WHERE id_articulo = $1 AND periodista_id = $2`,
      [articulo_id, userId]
    );
    if (!articleCheck.rows.length) return res.status(404).json({ message: "Artículo no encontrado o no autorizado" });

    const articuloViejo = articleCheck.rows[0];
    if (!['en_revision','rechazado','borrador'].includes(articuloViejo.estado)) {
      return res.status(400).json({ message: `No se puede reemplazar artículo en estado "${articuloViejo.estado}"` });
    }

    // Eliminar archivo antiguo de Cloudinary si existe
    if (articuloViejo.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(articuloViejo.cloudinary_public_id);
        console.log("✅ Archivo antiguo eliminado de Cloudinary");
      } catch (error) {
        console.warn("⚠️ No se pudo eliminar archivo antiguo de Cloudinary:", error.message);
      }
    }

    // Subir nuevo archivo a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "articulos",
      use_filename: true,
      unique_filename: true
    });

    const now = new Date();

    const updateQuery = `
      UPDATE articulos 
      SET titulo=$1, categoria_id=$2, tipo_archivo=$3, nombre_archivo=$4,
          nombre_original=$5, ruta_archivo=$6, tamaño_archivo=$7,
          fecha_modificacion=$8, estado='en_revision',
          cloudinary_url=$9, cloudinary_public_id=$10
      WHERE id_articulo=$11
      RETURNING *;
    `;

    const values = [
      titulo.trim(), categoria_id ? Number(categoria_id) : null,
      req.file.mimetype, req.file.filename, req.file.originalname,
      req.file.path, req.file.size, now,
      uploadResult.secure_url, uploadResult.public_id, articulo_id
    ];

    const result = await pool.query(updateQuery, values);

    // Limpiar archivo local temporal
    try {
      const fs = await import('fs');
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.warn("⚠️ No se pudo eliminar archivo temporal:", error.message);
    }

    // 🔹 Log
    await logAction({
      usuario_id: req.userId,
      accion: 'reemplazar',
      descripcion: `Reemplazó artículo ID ${articulo_id} en Cloudinary con archivo "${req.file.originalname}"`
    });

    res.status(200).json({ success:true, message:'Artículo actualizado y enviado a revisión', articulo: result.rows[0] });

  } catch (error) {
    console.error("❌ Error al reemplazar artículo:", error);
    res.status(500).json({ message: "Error interno del servidor al reemplazar artículo" });
  }
};

// =============================
// DESCARGAR ARTÍCULO DESDE CLOUDINARY
// =============================
export const downloadArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar rol del usuario
    const userCheck = await pool.query(
      `SELECT r.nombre as rol 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id_rol 
       WHERE u.id_usuario = $1`,
      [req.userId]
    );

    const isEditor = userCheck.rows.length > 0 && userCheck.rows[0].rol === 'Editor';

    let result;
    if (isEditor) {
      result = await pool.query(
        `SELECT cloudinary_url, nombre_original, tipo_archivo 
         FROM articulos WHERE id_articulo = $1`,
        [id]
      );
    } else {
      result = await pool.query(
        `SELECT cloudinary_url, nombre_original, tipo_archivo 
         FROM articulos WHERE id_articulo = $1 AND periodista_id = $2`,
        [id, req.userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    const { cloudinary_url, nombre_original } = result.rows[0];

    if (!cloudinary_url) {
      return res.status(404).json({ message: "Archivo no disponible" });
    }

    // Redirigir a Cloudinary para descarga
    res.redirect(cloudinary_url);

    await logAction({
      usuario_id: req.userId,
      accion: 'descargar',
      descripcion: `Descargó artículo ID ${id} desde Cloudinary`
    });

  } catch (error) {
    console.error("❌ Error al descargar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// VER ARTÍCULO DESDE CLOUDINARY
// ==========================
export const viewArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar rol del usuario
    const userCheck = await pool.query(
      `SELECT r.nombre as rol 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id_rol 
       WHERE u.id_usuario = $1`,
      [req.userId]
    );

    const isEditor = userCheck.rows.length > 0 && userCheck.rows[0].rol === 'Editor';

    let result;
    if (isEditor) {
      result = await pool.query(
        "SELECT cloudinary_url, nombre_original, tipo_archivo FROM articulos WHERE id_articulo = $1",
        [id]
      );
    } else {
      result = await pool.query(
        "SELECT cloudinary_url, nombre_original, tipo_archivo FROM articulos WHERE id_articulo = $1 AND periodista_id = $2",
        [id, req.userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    const { cloudinary_url, nombre_original, tipo_archivo } = result.rows[0];

    if (!cloudinary_url) {
      return res.status(404).json({ message: "Archivo no disponible en Cloudinary" });
    }

    // ✅ CORREGIDO: Enviar JSON con la información, NO redirigir
    res.json({
      success: true,
      viewUrl: cloudinary_url,
      filename: nombre_original,
      fileType: nombre_original.split('.').pop()?.toLowerCase() || tipo_archivo
    });

    await logAction({
      usuario_id: req.userId,
      accion: 'visualizar',
      descripcion: `Solicitó visualización de artículo ID ${id} (${nombre_original})`
    });

  } catch (error) {
    console.error("❌ Error al visualizar artículo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ELIMINAR ARTÍCULO (CON CLOUDINARY)
// =============================
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "ID de artículo inválido" });
    }

    const articleQuery = await pool.query(
      `SELECT periodista_id, cloudinary_public_id FROM articulos WHERE id_articulo = $1`,
      [parseInt(id)]
    );

    if (articleQuery.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no existe" });
    }

    if (articleQuery.rows[0].periodista_id !== userId) {
      return res.status(403).json({ message: "No autorizado para eliminar este artículo" });
    }

    // Eliminar de Cloudinary si existe
    const publicId = articleQuery.rows[0].cloudinary_public_id;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("✅ Archivo eliminado de Cloudinary");
      } catch (error) {
        console.warn("⚠️ No se pudo eliminar archivo de Cloudinary:", error.message);
      }
    }

    await pool.query(
      `UPDATE articulos 
       SET estado = 'eliminado', fecha_modificacion = $1 
       WHERE id_articulo = $2`,
      [new Date(), parseInt(id)]
    );

    res.json({ success: true, message: "Artículo eliminado correctamente" });

    await logAction({
      usuario_id: userId,
      accion: 'eliminar',
      descripcion: `Eliminó artículo ID ${id} de Cloudinary`
    });

  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ message: "Error al procesar la eliminación" });
  }
};

// =============================
// OBTENER MIS ARTÍCULOS (MEJORADA)
// =============================
export const getMyArticles = async (req, res) => {
  try {
    const periodista_id = req.userId;
    console.log('🔍 Buscando artículos para user ID:', periodista_id);
    
    const result = await pool.query(
      `SELECT a.*, c.nombre as categoria_nombre 
       FROM articulos a 
       LEFT JOIN categorias c ON a.categoria_id = c.id_categoria
       WHERE a.periodista_id = $1 AND a.estado != 'eliminado'
       ORDER BY 
         CASE 
           WHEN a.estado = 'en_revision' THEN 1
           WHEN a.estado = 'borrador' THEN 2
           WHEN a.estado = 'aprobado' THEN 3
           ELSE 4
         END,
         a.fecha_modificacion DESC`,
      [periodista_id]
    );
    
    console.log('📋 Artículos encontrados:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener artículos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER ARTÍCULO POR ID
// =============================
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const result = await pool.query(
      `SELECT a.*, c.nombre as categoria_nombre, 
              u.nombre as periodista_nombre, u.apellido as periodista_apellido
       FROM articulos a 
       LEFT JOIN categorias c ON a.categoria_id = c.id_categoria
       LEFT JOIN usuarios u ON a.periodista_id = u.id_usuario
       WHERE a.id_articulo = $1 AND (a.periodista_id = $2 OR $2 IN (
         SELECT id_usuario FROM usuarios WHERE rol_id = 1
       ))`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener artículo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ACTUALIZAR ARTÍCULO
// =============================
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { titulo, estado } = req.body; 

    const articleCheck = await pool.query(
      "SELECT * FROM articulos WHERE id_articulo = $1 AND periodista_id = $2",
      [id, userId]
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado o no autorizado" });
    }

    const updateQuery = `
      UPDATE articulos 
      SET titulo = $1, estado = $2, fecha_modificacion = $3  
      WHERE id_articulo = $4
      RETURNING *
    `;

    const values = [
      titulo,
      estado,
      new Date(),
      id
    ];

    const result = await pool.query(updateQuery, values);
    res.json(result.rows[0]);

    await logAction({
      usuario_id: req.userId,
      accion: 'actualizar',
      descripcion: `Actualizó artículo ID ${id}. Campos modificados: ${titulo ? 'titulo' : ''} ${estado ? 'estado' : ''}`
    });

  } catch (error) {
    console.error("❌ Error al actualizar artículo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ESTADOS Y FLUJO EDITORIAL
// =============================
export const sendToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('📨 Enviando a revisión artículo:', id, 'usuario:', userId);

    // Verificar que el artículo existe y pertenece al usuario
    const articleCheck = await pool.query(
      `SELECT * FROM articulos WHERE id_articulo = $1 AND periodista_id = $2`,
      [id, userId]
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado o no autorizado" });
    }

    const article = articleCheck.rows[0];
    
    if (article.estado !== 'borrador' && article.estado !== 'rechazado') {
      return res.status(400).json({ 
        message: `Solo los artículos en estado "borrador" pueden enviarse a revisión. Estado actual: ${article.estado}` 
      });
    }

    // Cambiar estado a "en_revision"
    await pool.query(
      `UPDATE articulos 
       SET estado = 'en_revision', fecha_modificacion = $1 
       WHERE id_articulo = $2`,
      [new Date(), id]
    );

    // Notificar a los editores
    await pool.query(`
      INSERT INTO notificaciones (titulo, mensaje, usuario_destino_id, leido, fecha)
      SELECT 
        'Nuevo artículo para revisión',
        $1,
        id_usuario,
        false,
        NOW()
      FROM usuarios 
      WHERE rol_id = (SELECT id_rol FROM roles WHERE nombre = 'Editor')
    `, [`El artículo "${article.titulo}" ha sido enviado a revisión`]);

    res.json({ 
      success: true, 
      message: 'Artículo enviado a revisión exitosamente' 
    });

  } catch (error) {
    console.error("❌ Error al enviar a revisión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getArticlesForReview = async (req, res) => {
  try {
    // Verificar que el usuario es editor
    const userCheck = await pool.query(
      `SELECT r.nombre as rol 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id_rol 
       WHERE u.id_usuario = $1`,
      [req.userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].rol !== 'Editor') {
      return res.status(403).json({ message: "No tienes permisos para ver artículos en revisión" });
    }

    const result = await pool.query(
      `SELECT a.*, u.nombre as periodista_nombre, u.apellido as periodista_apellido
       FROM articulos a
       JOIN usuarios u ON a.periodista_id = u.id_usuario
       WHERE a.estado = 'en_revision'
       ORDER BY a.fecha_modificacion DESC`
    );

    await logAction({
      usuario_id: req.userId,
      accion: 'visualizar',
      descripcion: `Revisó artículos en revisión como editor`
    });
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener artículos en revisión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// Aprobar artículo
// ==========================
export const approveArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const userId = req.userId;

    // Verificar que el usuario es editor
    const userCheck = await pool.query(
      `SELECT r.nombre as rol 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id_rol 
       WHERE u.id_usuario = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].rol !== 'Editor') {
      return res.status(403).json({ message: "No tienes permisos para aprobar artículos" });
    }

    // Verificar que el artículo existe y está en revisión
    const articleCheck = await pool.query(
      `SELECT * FROM articulos WHERE id_articulo = $1`,
      [id]
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    const article = articleCheck.rows[0];

    if (article.estado !== 'en_revision') {
      return res.status(400).json({ 
        message: `Solo los artículos en estado "en_revision" pueden ser aprobados. Estado actual: ${article.estado}` 
      });
    }

    // Cambiar estado a "aprobado" (con editor_id y fecha_publicacion)
    await pool.query(
      `UPDATE articulos 
       SET estado = 'aprobado', 
           fecha_publicacion = $1, 
           fecha_modificacion = $2, 
           editor_id = $3
       WHERE id_articulo = $4`,
      [new Date(), new Date(), userId, id]
    );

    // Notificar al periodista
    await pool.query(`
      INSERT INTO notificaciones (titulo, mensaje, usuario_destino_id, leido, fecha)
      VALUES ($1, $2, $3, false, NOW())
    `, [
      'Artículo aprobado',
      comentario || `Tu artículo "${article.titulo}" ha sido aprobado y publicado`,
      article.periodista_id
    ]);

    res.json({ 
      success: true, 
      message: 'Artículo aprobado y publicado exitosamente' 
    });

    await logAction({
      usuario_id: userId,
      accion: 'aprobar',
      descripcion: `Aprobó y publicó artículo ID ${id} ("${article.titulo}")`
    });

  } catch (error) {
    console.error("❌ Error al aprobar artículo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// Rechazar artículo 
// ==========================
export const rejectArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;
    const userId = req.userId;

    if (!comentario) {
      return res.status(400).json({ message: "Se requiere un comentario para rechazar un artículo" });
    }

    // Verificar que el usuario es editor
    const userCheck = await pool.query(
      `SELECT r.nombre as rol 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id_rol 
       WHERE u.id_usuario = $1`,
      [userId]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].rol !== 'Editor') {
      return res.status(403).json({ message: "No tienes permisos para rechazar artículos" });
    }

    // Verificar que el artículo existe y está en revisión
    const articleCheck = await pool.query(
      `SELECT * FROM articulos WHERE id_articulo = $1`,
      [id]
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    const article = articleCheck.rows[0];

    if (article.estado !== 'en_revision') {
      return res.status(400).json({ 
        message: `Solo los artículos en estado "en_revision" pueden ser rechazados. Estado actual: ${article.estado}` 
      });
    }

    // ✅ CORRECCIÓN: Cambiar estado a "rechazado" en lugar de "borrador"
    await pool.query(
      `UPDATE articulos 
       SET estado = 'rechazado', fecha_modificacion = $1, editor_id = $2
       WHERE id_articulo = $3`,
      [new Date(), userId, id]
    );

    // Notificar al periodista
    await pool.query(`
      INSERT INTO notificaciones (titulo, mensaje, usuario_destino_id, leido, fecha)
      VALUES ($1, $2, $3, false, NOW())
    `, [
      'Artículo rechazado',
      `🔴 ARTÍCULO RECHAZADO\n\nTu artículo "${article.titulo}" fue rechazado por el editor.\n\n📝 Comentario: ${comentario}\n\nPor favor, modifica el artículo y envíalo nuevamente a revisión.`,
      article.periodista_id
    ]);

    res.json({ 
      success: true, 
      message: 'Artículo rechazado y notificado al periodista' 
    });

    await logAction({
      usuario_id: userId,
      accion: 'rechazar',
      descripcion: `Rechazó artículo ID ${id} ("${article.titulo}"). Motivo: ${comentario.substring(0, 100)}${comentario.length > 100 ? '...' : ''}`
    });

  } catch (error) {
    console.error("❌ Error al rechazar artículo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER ARTÍCULOS APROBADOS (PARA EDITORES)
// =============================
export const getApprovedArticles = async (req, res) => {
  try {
    // La verificación de rol de editor ya se hace en la ruta
    const result = await pool.query(
      `SELECT a.*, u.nombre as periodista_nombre, u.apellido as periodista_apellido, u.usuario as periodista_usuario
       FROM articulos a
       JOIN usuarios u ON a.periodista_id = u.id_usuario
       WHERE a.estado = 'aprobado'
       ORDER BY a.fecha_publicacion DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener artículos aprobados:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getArticlesByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT a.*, c.nombre as categoria_nombre 
       FROM articulos a 
       LEFT JOIN categorias c ON a.categoria_id = c.id_categoria 
       WHERE a.periodista_id = $1 AND a.estado = $2
       ORDER BY a.fecha_modificacion DESC`,
      [userId, estado]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener artículos por estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER CATEGORÍAS
// =============================
export const getCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// OBTENER NOTIFICACIONES DE USUARIO
// =============================
export const getNotificacionesUsuario = async (req, res) => {
  try {
    const usuario_id = req.userId;
    
    const result = await pool.query(
      `SELECT * FROM notificaciones 
       WHERE usuario_destino_id = $1 
       ORDER BY fecha DESC`,
      [usuario_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getArticulosFiltrados = async (req, res) => {
  const { categoria } = req.query;
  
  try {
    let query = `
      SELECT 
        a.*, 
        c.nombre as categoria_nombre,
        u.nombre as autor_nombre, 
        u.apellido as autor_apellido,
        u.usuario as autor_usuario
      FROM articulos a
      JOIN categorias c ON a.categoria_id = c.id_categoria
      JOIN usuarios u ON a.periodista_id = u.id_usuario
      WHERE 1=1
    `;
    
    const params = [];
    
    if (categoria) {
      params.push(parseInt(categoria));
      query += ` AND a.categoria_id = $${params.length}`;
    }
    
    query += ` ORDER BY a.fecha_creacion DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener artículos filtrados:', error);
    res.status(500).json({ message: "Error al obtener artículos" });
  }
};