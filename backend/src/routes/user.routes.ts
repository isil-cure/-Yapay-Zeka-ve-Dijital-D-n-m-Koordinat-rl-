import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { Role } from '../models.types';

const router = Router();

// Tüm kullanıcı yönetimi rotaları kimlik doğrulaması gerektirir
router.use(authenticateToken);

// GET /api/users - Personel listesi (Admin ve zimmet atama için)
router.get('/', UserController.getUsers);

// PUT /api/users/:id - Personel bilgisi ve rolü güncelleme (Sadece ADMIN)
router.put('/:id', requireRole([Role.ADMIN]), UserController.updateUser);

// DELETE /api/users/:id - Personel silme (Sadece ADMIN)
router.delete('/:id', requireRole([Role.ADMIN]), UserController.deleteUser);

export default router;
