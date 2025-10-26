import { pool } from '../config/db.js';

export async function obtenerRoles(req, res) {
  try {
    const { rows } = await pool.query('SELECT id_rol as id, nombre FROM roles');
    res.json(rows);
  } catch (err) {
    console.error('💥 obtenerRoles:', err);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
}
