// backend/src/chat/chatController.js - CORREGIDO
import { pool } from "../config/db.js";

export async function guardarMensaje(emisorId, receptorId, contenido) {
  try {
    const result = await pool.query(
      `INSERT INTO mensajes (emisor_id, receptor_id, contenido) 
       VALUES ($1, $2, $3) 
       RETURNING id, emisor_id, receptor_id, contenido, fecha`,
      [emisorId, receptorId, contenido]
    );
    
    const mensajeGuardado = result.rows[0];
    
    // ✅ FORMATO CONSISTENTE para el frontend
    return {
      id: mensajeGuardado.id,
      emisor_id: mensajeGuardado.emisor_id,
      receptor_id: mensajeGuardado.receptor_id,
      contenido: mensajeGuardado.contenido,
      fecha: mensajeGuardado.fecha,
      fecha_envio: mensajeGuardado.fecha, // ← Ambos nombres por compatibilidad
      id_mensaje: mensajeGuardado.id // ← Para el frontend que espera id_mensaje
    };
    
  } catch (err) {
    console.error("❌ Error guardando mensaje:", err.message);
    return null;
  }
}

export async function obtenerMensajes(emisorId, receptorId) {
  try {
    const result = await pool.query(
      `SELECT id, emisor_id, receptor_id, contenido, fecha 
       FROM mensajes 
       WHERE (emisor_id = $1 AND receptor_id = $2) 
          OR (emisor_id = $2 AND receptor_id = $1)
       ORDER BY fecha ASC`,
      [emisorId, receptorId]
    );
    
    // ✅ Mismo formato consistente
    const mensajes = result.rows.map(mensaje => ({
      id: mensaje.id,
      emisor_id: mensaje.emisor_id,
      receptor_id: mensaje.receptor_id,
      contenido: mensaje.contenido,
      fecha: mensaje.fecha,
      fecha_envio: mensaje.fecha,
      id_mensaje: mensaje.id
    }));
    
    return mensajes;
  } catch (err) {
    console.error("❌ Error obteniendo mensajes:", err.message);
    return [];
  }
}