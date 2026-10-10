import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// POST /api/auth/login - Herkes erişebilir
router.post('/login', AuthController.login);

// POST /api/auth/register - Yalnızca ADMIN yeni personel ekleyebilir
router.post('/register', authenticateToken, requireRole([Role.ADMIN]), AuthController.register);

// GET /api/auth/me - Giriş yapmış kullanıcının profili
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
