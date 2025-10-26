import { pool } from "../config/db.js";
import { crearNotificacion } from "./notificacion.controller.js";

export async function guardarComentarioEditor(req, res) {
  const { articulo_id, comentario, editor_id, estado } = req.body;

  try {
    // Guardar comentario en BD
    await pool.query(`
      INSERT INTO comentarioseditor (articulo_id, editor_id, comentario, fecha)
      VALUES ($1, $2, $3, NOW())
    `, [articulo_id, editor_id, comentario]);

    // Actualizar estado del artículo
    await pool.query(`
      UPDATE articulos
      SET estado = $1, fecha_modificacion = NOW()
      WHERE id_articulo = $2
    `, [estado, articulo_id]);

    // Obtener datos del artículo y su periodista
    const { rows } = await pool.query(`
      SELECT a.titulo, u.id_usuario AS periodista_id
      FROM articulos a
      JOIN usuarios u ON a.periodista_id = u.id_usuario
      WHERE a.id_articulo = $1
    `, [articulo_id]);

    if (rows.length > 0) {
      const { titulo, periodista_id } = rows[0];

      // Crear título y mensaje de notificación
      const tituloNoti = `${titulo} - ${estado}`;
      const mensajeNoti = comentario;

      // Crear notificación para el periodista
      await crearNotificacion(tituloNoti, mensajeNoti, periodista_id);
    }

    res.json({ success: true, message: "Comentario y notificación guardados correctamente" });
  } catch (err) {
    console.error("❌ Error al guardar comentario:", err);
    res.status(500).json({ message: "Error al guardar el comentario" });
  }
}
