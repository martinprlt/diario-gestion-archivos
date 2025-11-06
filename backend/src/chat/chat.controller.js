// src/chat/chatController.js - CORREGIDO
import { pool } from "../config/db.js";

export async function guardarMensaje(emisorId, receptorId, contenido) {
  try {
    const result = await pool.query(
      `INSERT INTO mensajes (emisor_id, receptor_id, contenido) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [emisorId, receptorId, contenido]
    );
    
    const mensajeGuardado = result.rows[0];
    
    // Renombrar 'fecha' a 'fecha_envio' para el frontend
    return {
      ...mensajeGuardado,
      fecha_envio: mensajeGuardado.fecha, // ← CLAVE: renombrar aquí
      id_mensaje: mensajeGuardado.id
    };
    
  } catch (err) {
    console.error("❌ Error guardando mensaje:", err.message);
    return null;
  }
}

export async function obtenerMensajes(emisorId, receptorId) {
  try {
    const result = await pool.query(
      `SELECT * FROM mensajes 
       WHERE (emisor_id = $1 AND receptor_id = $2) 
          OR (emisor_id = $2 AND receptor_id = $1)
       ORDER BY fecha ASC`,
      [emisorId, receptorId]
    );
    
    // Renombrar 'fecha' a 'fecha_envio' para todos los mensajes
    const mensajes = result.rows.map(mensaje => ({
      ...mensaje,
      fecha_envio: mensaje.fecha, // ← CLAVE: renombrar aquí
      id_mensaje: mensaje.id
    }));
    
    return mensajes;
  } catch (err) {
    console.error("❌ Error obteniendo mensajes:", err.message);
    return [];
  }
}