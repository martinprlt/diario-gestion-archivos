// 📁 middlewares/trackActivity.js
import { trackUserActivity } from '../controllers/onlineUsers.controller.js';

// Middleware que combina verifyToken + trackUserActivity
export const authWithTracking = [verifyToken, trackUserActivity];