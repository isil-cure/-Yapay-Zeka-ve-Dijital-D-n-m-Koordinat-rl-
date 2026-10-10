import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Personele Cihaz Zimmetleme (Admin)
router.post('/assign', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, userId, notes, documentNo } = req.body;

    if (!assetId || !userId) {
      res.status(400).json({ message: 'Demirbaş ve personel seçilmelidir.' });
      return;
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    if (asset.status === 'ASSIGNED') {
      res.status(400).json({ message: 'Bu demirbaş zaten bir personele zimmetlidir. Önce iade alınmalıdır.' });
      return;
    }

    if (asset.status === 'SCRAPPED') {
      res.status(400).json({ message: 'Hurdaya ayrılmış bir cihaz zimmetlenemez.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      res.status(400).json({ message: 'Geçersiz veya pasif kullanıcı seçildi.' });
      return;
    }

    const docNo = documentNo || `ZMT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // İşlemi transaction ile atomik yap
    const result = await prisma.$transaction(async (tx) => {
      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          status: 'ASSIGNED',
          currentUserId: userId,
          location: `${user.department} - ${user.fullName}`,
        },
        include: { category: true, currentUser: true },
      });

      const log = await tx.custodyLog.create({
        data: {
          assetId,
          userId,
          actionType: 'ASSIGN',
          performedById: req.user!.id,
          notes: notes?.trim() || 'Personele teslim edildi.',
          documentNo: docNo,
        },
      });

      return { asset: updatedAsset, log };
    });

    res.status(200).json({
      message: `${result.asset.brand} ${result.asset.model} başarıyla ${user.fullName} personeline zimmetlendi.`,
      data: result,
    });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ message: 'Zimmetleme işlemi gerçekleştirilemedi.' });
  }
});

// Cihazı Zimmetten Düşme / İade Alma (Admin)
router.post('/return', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, notes, documentNo, returnLocation, newStatus } = req.body;

    if (!assetId) {
      res.status(400).json({ message: 'İade alınacak demirbaş belirtilmelidir.' });
      return;
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { currentUser: true },
    });

    if (!asset) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    if (asset.status !== 'ASSIGNED' || !asset.currentUserId) {
      res.status(400).json({ message: 'Bu cihaz zaten zimmetli durumda değildir.' });
      return;
    }

    const previousUserId = asset.currentUserId;
    const previousUserName = asset.currentUser?.fullName || 'Personel';
    const finalStatus = newStatus && ['AVAILABLE', 'IN_REPAIR', 'SCRAPPED'].includes(newStatus) ? newStatus : 'AVAILABLE';
    const finalLocation = returnLocation || 'Merkez Depo';
    const docNo = documentNo || `IAD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          status: finalStatus,
          currentUserId: null,
          location: finalLocation,
        },
        include: { category: true },
      });

      const log = await tx.custodyLog.create({
        data: {
          assetId,
          userId: previousUserId,
          actionType: 'RETURN',
          performedById: req.user!.id,
          notes: notes?.trim() || `${previousUserName} tarafından depoya iade edildi.`,
          documentNo: docNo,
        },
      });

      return { asset: updatedAsset, log };
    });

    res.json({
      message: `Cihaz ${previousUserName} üzerinden başarıyla iade alındı.`,
      data: result,
    });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ message: 'İade alma işlemi sırasında hata oluştu.' });
  }
});

// Arıza Durumu Bildirme (Hem Admin hem Personel kendi cihazı için yapabilir)
router.post('/report-fault', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, notes, faultType } = req.body;

    if (!assetId || !notes) {
      res.status(400).json({ message: 'Demirbaş ve arıza açıklaması zorunludur.' });
      return;
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    // Personel ise ve cihaz kendisinin değilse engelleyelim (Admin her cihaza yapabilir)
    if (req.user!.role !== 'ADMIN' && asset.currentUserId !== req.user!.id) {
      res.status(403).json({ message: 'Yalnızca kendi üzerinize zimmetli cihazlar için arıza bildirebilirsiniz.' });
      return;
    }

    const docNo = `ARZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          status: 'IN_REPAIR',
          location: 'Arıza / Teknik Servis Sürecinde',
        },
        include: { category: true },
      });

      const log = await tx.custodyLog.create({
        data: {
          assetId,
          userId: asset.currentUserId,
          actionType: 'REPORT_FAULT',
          performedById: req.user!.id,
          notes: `[Arıza Türü: ${faultType || 'Genel'}] ${notes}`,
          documentNo: docNo,
        },
      });

      return { asset: updatedAsset, log };
    });

    res.json({
      message: 'Arıza kaydı başarıyla oluşturuldu ve durum Teknik Servis olarak güncellendi.',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: 'Arıza kaydı oluşturulamadı.' });
  }
});

// Zimmet Hareket Logları & Denetim Tarihçesi (Pagination, Filtreleme)
router.get('/logs', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || '15'), 10));
    const skip = (page - 1) * limit;

    const { actionType, assetId, userId, search } = req.query;

    const where: any = {};
    if (actionType && actionType !== 'ALL') {
      where.actionType = String(actionType);
    }
    if (assetId) {
      where.assetId = String(assetId);
    }
    if (userId) {
      where.userId = String(userId);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { documentNo: { contains: q } },
        { notes: { contains: q } },
        { asset: { brand: { contains: q } } },
        { asset: { model: { contains: q } } },
        { asset: { serialNumber: { contains: q } } },
        { asset: { assetTag: { contains: q } } },
        { user: { fullName: { contains: q } } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.custodyLog.count({ where }),
      prisma.custodyLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { actionDate: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              brand: true,
              model: true,
              serialNumber: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              department: true,
            },
          },
          performedBy: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
    ]);

    res.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Zimmet hareketleri listelenirken hata oluştu.' });
  }
});

// Giriş Yapan Personelin Kişisel Zimmet Ekranı
router.get('/my-assets', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assets = await prisma.asset.findMany({
      where: { currentUserId: req.user!.id },
      include: {
        category: true,
        custodyLogs: {
          where: { userId: req.user!.id },
          orderBy: { actionDate: 'desc' },
          take: 5,
        },
      },
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Zimmetli cihazlarınız alınamadı.' });
  }
});

export default router;
