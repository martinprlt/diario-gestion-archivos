// backend/src/controllers/logs.controller.js - NOMBRES CORREGIDOS
import { pool } from "../config/db.js";

// =============================
// OBTENER TODOS LOS LOGS (Solo Admin) - NOMBRE CORREGIDO
// =============================
export const getLogs = async (req, res) => {
  console.log('🔍 GET /api/logs - Iniciando...');
  console.log('📋 Query params:', req.query);
  console.log('👤 Usuario:', req.user);

  try {
    const { limite = 100, pagina = 1, usuario_id, accion, desde, hasta } = req.query;
    
    console.log('📊 Params procesados:', { limite, pagina, usuario_id, accion, desde, hasta });

    let query = `
      SELECT 
        l.id_log,
        l.usuario_id,
        l.accion,
        l.descripcion,
        l.fecha,
        u.nombre,
        u.apellido,
        u.usuario,
        r.nombre as rol
      FROM logs l
      LEFT JOIN usuarios u ON l.usuario_id = u.id_usuario
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      WHERE 1=1
    `;
    
    const params = [];
    let paramCounter = 1;

    // Filtros opcionales
    if (usuario_id) {
      params.push(usuario_id);
      query += ` AND l.usuario_id = $${paramCounter++}`;
    }

    if (accion) {
      params.push(accion);
      query += ` AND l.accion = $${paramCounter++}`;
    }

    if (desde) {
      params.push(desde);
      query += ` AND l.fecha >= $${paramCounter++}`;
    }

    if (hasta) {
      params.push(hasta);
      query += ` AND l.fecha <= $${paramCounter++}`;
    }

    query += ` ORDER BY l.fecha DESC`;

    // Paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    params.push(parseInt(limite), offset);
    query += ` LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;

    console.log('📝 Query final:', query);
    console.log('🔢 Params:', params);

    const result = await pool.query(query, params);
    console.log('✅ Query ejecutada - Resultados:', result.rows.length);

    // Obtener total de logs para paginación
    let countQuery = `SELECT COUNT(*) FROM logs l WHERE 1=1`;
    const countParams = [];
    let countParamCounter = 1;

    if (usuario_id) {
      countParams.push(usuario_id);
      countQuery += ` AND l.usuario_id = $${countParamCounter++}`;
    }
    if (accion) {
      countParams.push(accion);
      countQuery += ` AND l.accion = $${countParamCounter++}`;
    }
    if (desde) {
      countParams.push(desde);
      countQuery += ` AND l.fecha >= $${countParamCounter++}`;
    }
    if (hasta) {
      countParams.push(hasta);
      countQuery += ` AND l.fecha <= $${countParamCounter++}`;
    }

    console.log('📊 Count query:', countQuery);
    console.log('🔢 Count params:', countParams);

    const countResult = await pool.query(countQuery, countParams);
    const totalLogs = parseInt(countResult.rows[0].count);

    console.log('📈 Total logs encontrados:', totalLogs);

    res.json({
      logs: result.rows,
      total: totalLogs,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(totalLogs / parseInt(limite))
    });

    console.log('✅ Respuesta enviada exitosamente');

  } catch (error) {
    console.error("❌ Error CRÍTICO en getLogs:", error);
    console.error("📋 Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message,
      code: error.code
    });
  }
};

// =============================
// OBTENER ESTADÍSTICAS DE LOGS - NOMBRE CORREGIDO
// =============================
export const getLogsStats = async (req, res) => {  // ✅ CAMBIADO: getLogStats → getLogsStats
  try {
    // Total de acciones por tipo
    const accionesPorTipo = await pool.query(`
      SELECT accion, COUNT(*) as cantidad
      FROM logs
      GROUP BY accion
      ORDER BY cantidad DESC
    `);

    // Usuarios más activos
    const usuariosActivos = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.usuario,
        r.nombre as rol,
        COUNT(l.id_log) as total_acciones
      FROM usuarios u
      LEFT JOIN logs l ON u.id_usuario = l.usuario_id
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      GROUP BY u.id_usuario, u.nombre, u.apellido, u.usuario, r.nombre
      ORDER BY total_acciones DESC
      LIMIT 10
    `);

    // Actividad por día (últimos 7 días)
    const actividadDiaria = await pool.query(`
      SELECT 
        DATE(fecha) as dia,
        COUNT(*) as cantidad
      FROM logs
      WHERE fecha >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(fecha)
      ORDER BY dia DESC
    `);

    // Total de logs
    const totalLogs = await pool.query(`SELECT COUNT(*) FROM logs`);

    res.json({
      accionesPorTipo: accionesPorTipo.rows,
      usuariosActivos: usuariosActivos.rows,
      actividadDiaria: actividadDiaria.rows,
      totalLogs: parseInt(totalLogs.rows[0].count)
    });

  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// =============================
// OBTENER ACCIONES DISPONIBLES
// =============================
export const getAccionesDisponibles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT accion 
      FROM logs 
      ORDER BY accion
    `);
    
    res.json(result.rows.map(row => row.accion));
  } catch (error) {
    console.error("❌ Error al obtener acciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// =============================
// LIMPIAR LOGS ANTIGUOS (Opcional)
// =============================
export const deleteLogs = async (req, res) => {
  try {
    const { dias } = req.body;

    if (!dias || dias < 30) {
      return res.status(400).json({ 
        message: "Debes especificar al menos 30 días para proteger datos recientes" 
      });
    }

    const result = await pool.query(
      `DELETE FROM logs 
       WHERE fecha < NOW() - INTERVAL '${dias} days'
       RETURNING id_log`
    );

    res.json({ 
      success: true, 
      message: `Se eliminaron ${result.rowCount} logs antiguos`,
      eliminados: result.rowCount
    });

  } catch (error) {
    console.error("❌ Error al eliminar logs:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};