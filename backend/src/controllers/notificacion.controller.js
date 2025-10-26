// 📁 backend/src/controllers/notificacion.controller.js - VERSIÓN MEJORADA
import { pool } from "../config/db.js";

// Crear notificación (1 usuario, grupo o todos)
export async function crearNotificacion(req, res) {
  const { titulo, mensaje, tipoDestino, valorDestino } = req.body;

  try {
    console.log("📨 Recibiendo notificación:", { titulo, tipoDestino, valorDestino });

    let usuariosDestino = [];

    // 🔹 DESTINO: USUARIO ESPECÍFICO (puede ser 1 o varios IDs separados por coma)
    if (tipoDestino === "usuario" && valorDestino) {
      if (valorDestino.includes(',')) {
        // Múltiples usuarios (IDs separados por coma)
        const idsUsuarios = valorDestino.split(',').map(id => id.trim());
        console.log("👥 Múltiples usuarios:", idsUsuarios);
        
        // Verificar que los usuarios existen
        const placeholders = idsUsuarios.map((_, index) => `$${index + 1}`).join(',');
        const { rows } = await pool.query(
          `SELECT id_usuario FROM usuarios WHERE id_usuario IN (${placeholders})`,
          idsUsuarios
        );
        
        usuariosDestino = rows.map(u => u.id_usuario);
      } else {
        // Un solo usuario
        usuariosDestino = [valorDestino];
        console.log("👤 Usuario único:", valorDestino);
      }
    } 
    // 🔹 DESTINO: GRUPO/ROL
    else if (tipoDestino === "grupo") {
      const { rows } = await pool.query(
        "SELECT id_usuario FROM usuarios u JOIN roles r ON u.rol_id = r.id_rol WHERE r.nombre = $1 AND u.activo = true",
        [valorDestino]
      );
      usuariosDestino = rows.map(u => u.id_usuario);
      console.log("👥 Grupo:", valorDestino, "- Usuarios:", usuariosDestino.length);
    } 
    // 🔹 DESTINO: TODOS LOS USUARIOS
    else if (tipoDestino === "todos") {
      const { rows } = await pool.query("SELECT id_usuario FROM usuarios WHERE activo = true");
      usuariosDestino = rows.map(u => u.id_usuario);
      console.log("🌍 Todos los usuarios:", usuariosDestino.length);
    }

    // 🔹 VERIFICAR QUE HAY DESTINATARIOS
    if (usuariosDestino.length === 0) {
      return res.status(400).json({ 
        message: "No se encontraron usuarios destinatarios" 
      });
    }

    // 🔹 INSERTAR NOTIFICACIONES
    for (const idUsuario of usuariosDestino) {
      await pool.query(`
        INSERT INTO notificaciones (titulo, mensaje, usuario_destino_id, leido, fecha)
        VALUES ($1, $2, $3, false, NOW())
      `, [titulo, mensaje, idUsuario]);
    }
    
    console.log(`✅ Notificaciones creadas: ${usuariosDestino.length} enviadas`);

    res.status(201).json({ 
      message: `Notificación enviada a ${usuariosDestino.length} usuario(s)`,
      destinatarios: usuariosDestino.length
    });

  } catch (err) {
    console.error("❌ Error al crear notificación:", err);
    res.status(500).json({ 
      message: "Error interno del servidor al crear notificación",
      error: err.message 
    });
  }
}

// Obtener notificaciones de un usuario (CORREGIDO)
export async function obtenerNotificaciones(req, res) {
  const usuarioId = req.params.usuarioId; // 👈 SIN {}
  
  try {
    console.log("📥 Obteniendo notificaciones para usuario:", usuarioId);
    
    const { rows } = await pool.query(`
      SELECT 
        id_notificacion,
        titulo,
        mensaje,
        usuario_destino_id,
        leido,
        TO_CHAR(fecha, 'YYYY-MM-DD HH24:MI:SS') AS fecha
      FROM notificaciones
      WHERE usuario_destino_id = $1
      ORDER BY fecha DESC
      LIMIT 50
    `, [usuarioId]);

    console.log(`📋 Notificaciones encontradas: ${rows.length}`);
    
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error al obtener notificaciones:", err);
    res.status(500).json({ 
      message: "Error al obtener notificaciones",
      error: err.message 
    });
  }
}

// Marcar como leída
export async function marcarNotificacionLeida(req, res) {
  const { id_notificacion } = req.body;
  try {
    await pool.query(`
      UPDATE notificaciones
      SET leido = true
      WHERE id_notificacion = $1
    `, [id_notificacion]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error al marcar notificación como leída:", err);
    res.status(500).json({ message: "Error al actualizar notificación" });
  }
}