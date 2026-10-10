import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AssetService } from '../services/asset.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AssignmentController {
  /**
   * POST /api/assets/:id/assign
   * Cihazı personele atar, durumunu ACTIVE yapar, AssignmentHistory tablosuna log atar.
   */
  static async assignAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { userId, notes } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'Demirbaşın zimmetleneceği personel (userId) zorunludur.',
        });
        return;
      }

      const updatedAsset = await AssetService.assignAsset(id, String(userId), notes ? String(notes) : undefined);

      res.status(200).json({
        success: true,
        message: 'Demirbaş başarıyla personele zimmetlendi.',
        data: updatedAsset,
      });
    } catch (error: any) {
      console.error('Zimmet atama hatası:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Zimmetleme işlemi gerçekleştirilemedi.',
      });
    }
  }

  /**
   * POST /api/assets/:id/return
   * Cihazı personelden düşer, durumunu IN_STOCK yapar, AssignmentHistory tablosuna log atar.
   */
  static async returnAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { notes } = req.body;

      const updatedAsset = await AssetService.returnAsset(id, notes ? String(notes) : undefined);

      res.status(200).json({
        success: true,
        message: 'Demirbaş depoya iade alındı ve zimmet kaydı güncellendi.',
        data: updatedAsset,
      });
    } catch (error: any) {
      console.error('Zimmet iade hatası:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'İade işlemi gerçekleştirilemedi.',
      });
    }
  }

  /**
   * GET /api/assets/:id/history
   * Demirbaş zimmet geçmişi denetim izi
   */
  static async getAssetHistory(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const history = await prisma.assignmentHistory.findMany({
        where: { assetId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, department: true, email: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Zimmet geçmişi hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Zimmet denetim izi alınamadı.',
      });
    }
  }
}
