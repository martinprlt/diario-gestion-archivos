// backend/src/routes/logs.routes.js - AGREGAR ESTO TEMPORALMENTE
import { Router } from "express";
import { 
  getLogs, 
  getLogsStats, 
  getAccionesDisponibles,
  deleteLogs 
} from "../controllers/logs.controller.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import { pool } from "../config/db.js";

const router = Router();

// Endpoint de diagnóstico temporal
router.get("/debug", verifyToken, async (req, res) => {
  try {
    console.log('🔍 Debug endpoint llamado');
    
    // Verificar si la tabla logs existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'logs'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📊 Tabla logs existe:', tableExists);

    if (tableExists) {
      // Contar registros
      const countResult = await pool.query('SELECT COUNT(*) as total FROM logs');
      const totalLogs = countResult.rows[0].total;
      console.log('📈 Total de logs en BD:', totalLogs);

      // Verificar estructura
      const structure = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'logs' 
        ORDER BY ordinal_position;
      `);

      res.json({
        tableExists,
        totalLogs,
        structure: structure.rows,
        user: req.user
      });
    } else {
      res.json({
        tableExists: false,
        message: "La tabla 'logs' no existe en la base de datos"
      });
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Todas las rutas requieren autenticación y rol de Admin
router.use(verifyToken);
router.use(checkRole(['Admin', 'Administrador']));

// Rutas normales
router.get("/", getLogs);
router.get("/stats", getLogsStats);
router.get("/acciones", getAccionesDisponibles);
router.delete("/limpiar", deleteLogs);

export default router;