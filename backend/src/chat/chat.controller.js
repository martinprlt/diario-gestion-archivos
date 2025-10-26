// src/chat/chatController.js
import { pool } from "../config/db.js";

export async function guardarMensaje(emisorId, receptorId, contenido) {
  try {
    const result = await pool.query(
      `INSERT INTO mensajes (emisor_id, receptor_id, contenido) VALUES ($1, $2, $3) RETURNING *`,
      [emisorId, receptorId, contenido]
    );
    return result.rows[0]; // Devolver el mensaje guardado
  } catch (err) {
    console.error("❌ Error guardando mensaje:", err.message);
    return null; // Devolver null en caso de error
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
    return result.rows;
  } catch (err) {
    console.error("❌ Error obteniendo mensajes:", err.message);
    return [];
  }
}
