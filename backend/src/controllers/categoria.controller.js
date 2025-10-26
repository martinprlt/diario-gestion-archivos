import { pool } from "../config/db.js";

// =============================
// OBTENER TODAS LAS CATEGORÍAS
// =============================
export const getCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categorias ORDER BY nombre`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// CREAR NUEVA CATEGORÍA
// =============================
export const createCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    if (!nombre) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    }

    const categoriaExistente = await pool.query(
      'SELECT id_categoria FROM categorias WHERE nombre = $1',
      [nombre]
    );

    if (categoriaExistente.rows.length > 0) {
      return res.status(409).json({ message: "Ya existe una categoría con ese nombre" });
    }
    const result = await pool.query(
      `INSERT INTO categorias (nombre, descripcion, fecha_creacion) 
       VALUES ($1, $2, NOW()) 
       RETURNING *`,
      [nombre, descripcion || '']
    );

    res.status(201).json({ 
      message: "Categoría creada exitosamente",
      categoria: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error al crear categoría:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ELIMINAR CATEGORÍA
// =============================
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const categoriaCheck = await pool.query(
      'SELECT id_categoria FROM categorias WHERE id_categoria = $1',
      [id]
    );

    if (categoriaCheck.rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const articulosAsociados = await pool.query(
      'SELECT COUNT(*) FROM articulos WHERE categoria_id = $1',
      [id]
    );

    if (parseInt(articulosAsociados.rows[0].count) > 0) {
      return res.status(409).json({ 
        message: "No se puede eliminar la categoría porque tiene artículos asociados" 
      });
    }

    await pool.query('DELETE FROM categorias WHERE id_categoria = $1', [id]);

    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// ACTUALIZAR CATEGORÍA
// =============================
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const categoriaCheck = await pool.query(
      'SELECT id_categoria FROM categorias WHERE id_categoria = $1',
      [id]
    );

    if (categoriaCheck.rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    if (nombre) {
      const nombreExistente = await pool.query(
        'SELECT id_categoria FROM categorias WHERE nombre = $1 AND id_categoria != $2',
        [nombre, id]
      );

      if (nombreExistente.rows.length > 0) {
        return res.status(409).json({ message: "Ya existe una categoría con ese nombre" });
      }
    }

    const result = await pool.query(
      `UPDATE categorias 
       SET nombre = COALESCE($1, nombre), 
           descripcion = COALESCE($2, descripcion),
           fecha_creacion = fecha_creacion
       WHERE id_categoria = $3 
       RETURNING *`,
      [nombre, descripcion, id]
    );

    res.json({ 
      message: "Categoría actualizada exitosamente",
      categoria: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error al actualizar categoría:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};