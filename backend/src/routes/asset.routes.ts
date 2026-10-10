import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { AssignmentController } from '../controllers/assignment.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Tüm demirbaş rotaları kimlik doğrulaması gerektirir
router.use(authenticateToken);

// GET /api/assets - Sayfalama, arama, filtreleme
router.get('/', AssetController.getAssets);

// GET /api/assets/qr/:assetTag - QR kod etiketi ile demirbaş sorgulama
router.get('/qr/:assetTag', AssetController.getAssetByTag);

// GET /api/assets/:id - Cihaz detayı, zimmetli personel ve denetim izi
router.get('/:id', AssetController.getAssetById);

// GET /api/assets/:id/history - Zimmet geçmişi zaman çizelgesi
router.get('/:id/history', AssignmentController.getAssetHistory);

// POST /api/assets - Yeni demirbaş kaydı ve otomatik QR üretimi (ADMIN)
router.post('/', requireRole([Role.ADMIN]), AssetController.createAsset);

// PUT /api/assets/:id - Demirbaş güncelleme (ADMIN)
router.put('/:id', requireRole([Role.ADMIN]), AssetController.updateAsset);

// DELETE /api/assets/:id - Demirbaş silme (ADMIN)
router.delete('/:id', requireRole([Role.ADMIN]), AssetController.deleteAsset);

// POST /api/assets/:id/assign - Personele zimmetleme (ADMIN)
router.post('/:id/assign', requireRole([Role.ADMIN]), AssignmentController.assignAsset);

// POST /api/assets/:id/return - Zimmet iadesi / depoya çekme (ADMIN)
router.post('/:id/return', requireRole([Role.ADMIN]), AssignmentController.returnAsset);

export default router;
