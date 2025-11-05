// src/chat/chat.controller.js
import { pool } from "../config/db.js";

export async function guardarMensaje(emisorId, receptorId, contenido) {
  console.log("💾 Intentando guardar mensaje:", { emisorId, receptorId, contenido: contenido.substring(0, 50) });
  
  try {
    const result = await pool.query(
      `INSERT INTO mensajes (emisor_id, receptor_id, contenido) 
       VALUES ($1, $2, $3) 
       RETURNING id_mensaje, emisor_id, receptor_id, contenido, fecha_envio`,
      [emisorId, receptorId, contenido]
    );
    
    console.log("✅ Mensaje guardado en DB:", result.rows[0].id_mensaje);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error SQL guardando mensaje:");
    console.error("   Código:", err.code);
    console.error("   Mensaje:", err.message);
    console.error("   Detalle:", err.detail);
    throw err;
  }
}

export async function obtenerMensajes(emisorId, receptorId) {
  console.log("📖 Obteniendo mensajes entre:", { emisorId, receptorId });
  
  try {
    const result = await pool.query(
      `SELECT id_mensaje, emisor_id, receptor_id, contenido, fecha_envio
       FROM mensajes 
       WHERE (emisor_id = $1 AND receptor_id = $2) 
          OR (emisor_id = $2 AND receptor_id = $1)
       ORDER BY fecha_envio ASC`,
      [emisorId, receptorId]
    );
    
    console.log(`✅ Mensajes obtenidos: ${result.rows.length}`);
    return result.rows;
  } catch (err) {
    console.error("❌ Error SQL obteniendo mensajes:");
    console.error("   Código:", err.code);
    console.error("   Mensaje:", err.message);
    throw err;
  }
}