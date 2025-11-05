// src/helpers/logAction.js
import { pool } from "../config/db.js";

export const logAction = async ({ usuario_id, accion, descripcion }) => {
  try {
    await pool.query(
      `INSERT INTO logs (usuario_id, accion, descripcion, fecha)
       VALUES ($1, $2, $3, NOW())`,
      [usuario_id, accion, descripcion]
    );
  } catch (error) {
    console.error("❌ Error al registrar log:", error);
  }
};
