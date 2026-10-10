import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateQrDataUrl } from '../services/qr.service';

const router = Router();

// QR Kodu Çözümle ve Cihaz Detayını Getir (Mobil Kamera Taraması)
router.get('/lookup/:query', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawQueryString = String(req.params.query || '');
    let rawQuery = decodeURIComponent(rawQueryString).trim();

    // Eğer QR içerisi JSON formatında ise ayrıştır
    let tagOrSn = rawQuery;
    if (rawQuery.startsWith('{') && rawQuery.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawQuery);
        tagOrSn = parsed.tag || parsed.sn || parsed.id || rawQuery;
      } catch (e) {
        // düz string olarak devam et
      }
    }

    const asset = await prisma.asset.findFirst({
      where: {
        OR: [
          { assetTag: tagOrSn },
          { serialNumber: tagOrSn },
          { id: tagOrSn },
        ],
      },
      include: {
        category: true,
        currentUser: {
          select: { id: true, fullName: true, department: true, email: true, phone: true },
        },
        custodyLogs: {
          take: 5,
          orderBy: { actionDate: 'desc' },
          include: {
            user: { select: { fullName: true } },
            performedBy: { select: { fullName: true } },
          },
        },
      },
    });

    if (!asset) {
      res.status(404).json({ message: 'Okutulan QR koda ait demirbaş kaydı bulunamadı.' });
      return;
    }

    const qrPayload = JSON.stringify({
      tag: asset.assetTag,
      sn: asset.serialNumber,
      id: asset.id,
      brand: asset.brand,
      model: asset.model,
    });
    const qrDataUrl = await generateQrDataUrl(qrPayload);

    res.json({
      ...asset,
      qrDataUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'QR sorgulaması başarısız oldu.' });
  }
});

// Saha Hızlı İşlem API (Teslim Et, Geri Kabul Et, Arıza Bildir)
router.post('/quick-action', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, actionType, targetUserId, notes, location } = req.body;

    if (!assetId || !actionType) {
      res.status(400).json({ message: 'Demirbaş ID ve işlem türü gereklidir.' });
      return;
    }

    const asset = await prisma.asset.findUnique({
      where: { id: String(assetId) },
      include: { currentUser: true },
    });

    if (!asset) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    const docNo = `SAHA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (actionType === 'ASSIGN') {
      // Sadece admin sahada teslim edebilir
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({ message: 'Saha teslim işlemi için yetkiniz bulunmamaktadır.' });
        return;
      }
      if (!targetUserId) {
        res.status(400).json({ message: 'Teslim edilecek personel seçilmelidir.' });
        return;
      }

      const targetUser = await prisma.user.findUnique({ where: { id: String(targetUserId) } });
      if (!targetUser) {
        res.status(404).json({ message: 'Seçilen personel bulunamadı.' });
        return;
      }

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.asset.update({
          where: { id: String(assetId) },
          data: {
            status: 'ASSIGNED',
            currentUserId: String(targetUserId),
            location: `${targetUser.department} - Sahada Teslim`,
          },
          include: { category: true, currentUser: true },
        });

        const log = await tx.custodyLog.create({
          data: {
            assetId: String(assetId),
            userId: String(targetUserId),
            actionType: 'ASSIGN',
            performedById: req.user!.id,
            notes: notes ? `[Saha Hızlı Teslim] ${notes}` : '[Saha Hızlı Teslim] QR ile personele teslim edildi.',
            documentNo: docNo,
          },
        });
        return { asset: updated, log };
      });

      res.json({ message: `Cihaz ${targetUser.fullName} personeline başarıyla teslim edildi.`, data: result });
      return;
    }

    if (actionType === 'RETURN') {
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({ message: 'Geri kabul işlemi için yetkiniz bulunmamaktadır.' });
        return;
      }

      const prevUser = asset.currentUser;
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.asset.update({
          where: { id: String(assetId) },
          data: {
            status: 'AVAILABLE',
            currentUserId: null,
            location: location || 'Merkez Depo (Sahadan İade)',
          },
          include: { category: true },
        });

        const log = await tx.custodyLog.create({
          data: {
            assetId: String(assetId),
            userId: prevUser?.id || null,
            actionType: 'RETURN',
            performedById: req.user!.id,
            notes: notes ? `[Saha Geri Kabul] ${notes}` : '[Saha Geri Kabul] QR ile sahada geri kabul edildi.',
            documentNo: docNo,
          },
        });
        return { asset: updated, log };
      });

      res.json({ message: 'Cihaz depoya geri kabul edildi.', data: result });
      return;
    }

    if (actionType === 'REPORT_FAULT') {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.asset.update({
          where: { id: String(assetId) },
          data: {
            status: 'IN_REPAIR',
            location: 'Teknik Servis (Saha Arıza Bildirimi)',
          },
          include: { category: true },
        });

        const log = await tx.custodyLog.create({
          data: {
            assetId: String(assetId),
            userId: asset.currentUserId,
            actionType: 'REPORT_FAULT',
            performedById: req.user!.id,
            notes: notes ? `[Saha Arıza] ${notes}` : '[Saha Arıza] Mobil QR tarama ile arıza bildirildi.',
            documentNo: docNo,
          },
        });
        return { asset: updated, log };
      });

      res.json({ message: 'Arıza kaydı açıldı, cihaz durumu Arızalı/Bakımda olarak işaretlendi.', data: result });
      return;
    }

    res.status(400).json({ message: 'Geçersiz saha işlemi türü.' });
  } catch (error) {
    res.status(500).json({ message: 'Saha işlemi gerçekleştirilemedi.' });
  }
});

export default router;
