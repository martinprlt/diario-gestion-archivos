//src/routes/notificaciones.routes.js
import { Router } from "express";
import {
    obtenerNotificaciones,
    marcarNotificacionLeida,
    crearNotificacion
} from "../controllers/notificacion.controller.js";


const router = Router();

router.get("/:usuarioId", obtenerNotificaciones);
router.post("/marcar-leida", marcarNotificacionLeida);
router.post("/crear", crearNotificacion);

export default router;
