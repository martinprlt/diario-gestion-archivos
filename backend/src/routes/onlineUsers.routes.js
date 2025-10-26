import express from 'express';
import { 
  getOnlineUsers, 
  updateHeartbeat, 
  removeUserSession 
} from '../controllers/onlineUsers.controller.js';
import { verifyToken, checkAdminRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Dashboard de usuarios online (solo admin)
router.get('/online-users', verifyToken, checkAdminRole, getOnlineUsers);

// ✅ Heartbeat - cualquier usuario autenticado
router.post('/heartbeat', verifyToken, updateHeartbeat);

// ✅ Logout manual
router.post('/logout', verifyToken, removeUserSession);

export default router;