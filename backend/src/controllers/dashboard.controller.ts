import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AssetStatus } from '../models.types';

export class DashboardController {
  /**
   * GET /api/dashboard/stats
   * Toplam cihaz, aktif zimmetli cihaz, depoda/boşta bekleyen cihaz,
   * arızalı cihaz sayılarını ve son 5 zimmet hareketini döner.
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [totalAssets, activeAssigned, inStock, inRepair, scrapped] = await Promise.all([
        prisma.asset.count(),
        prisma.asset.count({ where: { status: AssetStatus.ACTIVE } }),
        prisma.asset.count({ where: { status: AssetStatus.IN_STOCK } }),
        prisma.asset.count({ where: { status: AssetStatus.IN_REPAIR } }),
        prisma.asset.count({ where: { status: AssetStatus.SCRAPPED } }),
      ]);

      // Son 5 zimmet / durum hareketi
      const recentActivities = await prisma.assignmentHistory.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              brand: true,
              model: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              department: true,
              email: true,
            },
          },
        },
      });

      // Departman dağılımı (Zimmetli aktif cihazlar için)
      const assignedAssets = await prisma.asset.findMany({
        where: {
          status: AssetStatus.ACTIVE,
          assignedToUserId: { not: null },
        },
        include: {
          assignedToUser: {
            select: { department: true },
          },
        },
      });

      const departmentCounts: Record<string, number> = {};
      assignedAssets.forEach((asset) => {
        const dept = asset.assignedToUser?.department || 'Diğer';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalAssets,
            activeAssigned,
            inStock,
            inRepair,
            scrapped,
          },
          recentActivities,
          departmentDistribution: departmentCounts,
        },
      });
    } catch (error) {
      console.error('Dashboard istatistik hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kontrol paneli istatistikleri alınırken hata oluştu.',
      });
    }
  }
}
