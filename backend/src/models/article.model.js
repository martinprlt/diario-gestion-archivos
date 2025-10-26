// src/models/article.model.js
import { pool } from '../config/db.js';

const Article = {};

// CREAR artículo (ahora con archivo)
Article.create = async (articleData) => {
    const { 
        titulo, 
        nombre_archivo,      // NUEVO
        nombre_original,     // NUEVO: nombre original del archivo
        ruta_archivo,        // NUEVO  
        tipo_archivo,        // NUEVO
        tamaño_archivo,      // NUEVO
        estado, 
        fecha_creacion, 
        fecha_modificacion, 
        periodista_id, 
        categoria_id 
    } = articleData;
    
    const query = `
        INSERT INTO articulos (
            titulo, 
            nombre_archivo, 
            nombre_original,
            ruta_archivo, 
            tipo_archivo, 
            tamaño_archivo,
            estado, 
            fecha_creacion, 
            fecha_modificacion, 
            periodista_id, 
            categoria_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `;
    
    const values = [
        titulo, 
        nombre_archivo, 
        nombre_original,
        ruta_archivo, 
        tipo_archivo, 
        tamaño_archivo,
        estado, 
        fecha_creacion, 
        fecha_modificacion, 
        periodista_id, 
        categoria_id
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Las demás funciones quedan igual
Article.findById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM articulos WHERE id_articulo = $1', [id]);
    return rows[0];
};

Article.findByPeriodista = async (periodistaId) => {
    const query = 'SELECT * FROM articulos WHERE periodista_id = $1 ORDER BY fecha_modificacion DESC';
    const { rows } = await pool.query(query, [periodistaId]);
    return rows;
};

// UPDATE - modificamos para archivos
Article.update = async (id, articleData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Solo título se puede actualizar (el archivo no se cambia)
    if (articleData.titulo !== undefined) {
        fields.push(`titulo = $${paramCount}`);
        values.push(articleData.titulo);
        paramCount++;
    }
    
    if (articleData.categoria_id !== undefined) {
        fields.push(`categoria_id = $${paramCount}`);
        values.push(articleData.categoria_id);
        paramCount++;
    }
    
    if (articleData.estado !== undefined) {
        fields.push(`estado = $${paramCount}`);
        values.push(articleData.estado);
        paramCount++;
    }
    
    if (articleData.fecha_modificacion !== undefined) {
        fields.push(`fecha_modificacion = $${paramCount}`);
        values.push(articleData.fecha_modificacion);
        paramCount++;
    }

    if (fields.length === 0) {
        return false;
    }

    values.push(id);
    
    const query = `
        UPDATE articulos
        SET ${fields.join(', ')}
        WHERE id_articulo = $${paramCount}
        RETURNING *;
    `;
    
    const { rows } = await pool.query(query, values);
    return rows.length > 0;
};

Article.delete = async (id) => {
    const { rowCount } = await pool.query('DELETE FROM articulos WHERE id_articulo = $1', [id]);
    return rowCount > 0;
};

Article.findByStatus = async (estado) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.nombre as periodista_nombre, u.apellido as periodista_apellido 
       FROM articulos a 
       JOIN usuarios u ON a.periodista_id = u.id_usuario 
       WHERE a.estado = $1 
       ORDER BY a.fecha_creacion DESC`,
      [estado]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};


export default Article;