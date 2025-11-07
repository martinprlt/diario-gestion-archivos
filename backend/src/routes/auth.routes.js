// backend/src/routes/auth.routes.js 
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = Router();


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: {
    error: 'Demasiados intentos de login. Por seguridad, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 

});

// ✅ Aplicar rate limiter SOLO a login
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;