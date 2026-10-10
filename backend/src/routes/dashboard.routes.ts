import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalAssets,
      assignedCount,
      availableCount,
      inRepairCount,
      scrappedCount,
      totalUsers,
      categories,
      recentLogs,
      costAggregate,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'IN_REPAIR' } }),
      prisma.asset.count({ where: { status: 'SCRAPPED' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { assets: true },
          },
        },
      }),
      prisma.custodyLog.findMany({
        take: 6,
        orderBy: { actionDate: 'desc' },
        include: {
          asset: { select: { brand: true, model: true, assetTag: true } },
          user: { select: { fullName: true, department: true } },
          performedBy: { select: { fullName: true } },
        },
      }),
      prisma.asset.aggregate({
        _sum: { cost: true },
      }),
    ]);

    // Departman bazlı zimmet dağılımı
    const assignedAssets = await prisma.asset.findMany({
      where: { status: 'ASSIGNED', currentUser: { isNot: null } },
      select: {
        currentUser: { select: { department: true } },
      },
    });

    const departmentCounts: Record<string, number> = {};
    for (const item of assignedAssets) {
      const dept = item.currentUser?.department || 'Diğer';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    }

    res.json({
      summary: {
        totalAssets,
        assignedCount,
        availableCount,
        inRepairCount,
        scrappedCount,
        totalUsers,
        totalEstimatedValue: costAggregate._sum.cost || 0,
      },
      categoryDistribution: categories.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        count: c._count.assets,
      })),
      departmentDistribution: Object.entries(departmentCounts).map(([department, count]) => ({
        department,
        count,
      })),
      recentLogs,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Dashboard verileri alınamadı.' });
  }
});

export default router;
