//src/models/user.model.js
import { pool } from '../config/db.js';

export async function findByUsuario(usuario) {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = $1',
      [usuario]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function findByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function createUser(userData) {
  const { nombre, apellido, usuario, passwordHash, email, telefono, rolId } = userData;
  
  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, usuario, contraseña, email, telefono, rol_id, activo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
       RETURNING id_usuario, nombre, apellido, usuario, email, telefono, rol_id, activo`,
      [nombre, apellido, usuario, passwordHash, email, telefono, rolId]
    );
    
    return result.rows[0]; // En PostgreSQL es result.rows[0]
  } catch (error) {
    throw error;
  }
}


export async function findAll() {
  try {
    const result = await pool.query(`
      SELECT 
        id_usuario, 
        nombre, 
        apellido, 
        usuario, 
        email, 
        telefono, 
        rol_id,
        activo,
        categoria_id,
        avatar_url
      FROM usuarios 
      ORDER BY nombre
    `);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id_usuario, nombre, apellido, email, telefono 
     FROM usuarios WHERE id_usuario = $1`,
    [id]
  );
  return rows[0];
}

export async function updateUser(id, { nombre, apellido, email, telefono, rol_id }) {
  let updateQuery;
  let queryParams;

  if (rol_id !== undefined) {
    updateQuery = `
      UPDATE usuarios 
      SET nombre = $1, apellido = $2, email = $3, telefono = $4, rol_id = $5
      WHERE id_usuario = $6
      RETURNING id_usuario, nombre, apellido, email, telefono, rol_id
    `;
    queryParams = [nombre, apellido, email, telefono, rol_id, id];
  } else {
    updateQuery = `
      UPDATE usuarios 
      SET nombre = $1, apellido = $2, email = $3, telefono = $4
      WHERE id_usuario = $5
      RETURNING id_usuario, nombre, apellido, email, telefono, rol_id
    `;
    queryParams = [nombre, apellido, email, telefono, id];
  }

  const { rows } = await pool.query(updateQuery, queryParams);
  return rows[0];
}

export async function deleteUser(id) {
  const result = await pool.query(
    'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
    [id]
  );
  return result.rowCount;
}

export async function findRoles() {
  try {
    // Consulta corregida - sin filtrar por columna 'activo'
    const result = await pool.query('SELECT id_rol, nombre FROM roles ORDER BY nombre');
    return result.rows;
  } catch (error) {
    throw error;
  }
}
