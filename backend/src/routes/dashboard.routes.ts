import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/dashboard/stats - Kimlik doğrulamalı kullanıcılar için istatistikler
router.get('/stats', authenticateToken, DashboardController.getStats);

export default router;
