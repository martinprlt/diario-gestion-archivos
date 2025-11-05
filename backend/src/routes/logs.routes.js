// src/routes/logs.routes.js
import { Router } from "express";
import { 
  getAllLogs, 
  getLogStats, 
  getAccionesDisponibles,
  deleteLogs 
} from "../controllers/logs.controller.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación y rol de Admin
router.use(verifyToken);
router.use(checkRole(['Admin', 'Administrador']));

// Obtener todos los logs con filtros
router.get("/", getAllLogs);

// Obtener estadísticas
router.get("/stats", getLogStats);

// Obtener tipos de acciones disponibles
router.get("/acciones", getAccionesDisponibles);

// Eliminar logs antiguos (CUIDADO - solo admin)
router.delete("/limpiar", deleteLogs);

export default router;