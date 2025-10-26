import { Router } from 'express';
import { obtenerRoles } from '../controllers/roles.controller.js';

const router = Router();

router.get('/roles', obtenerRoles);

export default router;
