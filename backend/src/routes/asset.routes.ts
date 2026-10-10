import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { generateNextAssetTag, generateQrDataUrl } from '../services/qr.service';

const router = Router();

// Demirbaş Listesi (Arama, Filtreleme, Sayfalama)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || '10'), 10));
    const skip = (page - 1) * limit;

    const { search, status, categoryId, department, currentUserId } = req.query;

    const where: any = {};

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { brand: { contains: q } },
        { model: { contains: q } },
        { serialNumber: { contains: q } },
        { assetTag: { contains: q } },
        { location: { contains: q } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = String(categoryId);
    }

    if (currentUserId) {
      where.currentUserId = String(currentUserId);
    }

    if (department && department !== 'ALL') {
      where.currentUser = {
        department: String(department),
      };
    }

    const [total, assets] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          currentUser: {
            select: { id: true, fullName: true, email: true, department: true },
          },
        },
      }),
    ]);

    res.json({
      data: assets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Asset list error:', error);
    res.status(500).json({ message: 'Demirbaşlar listelenirken hata oluştu.' });
  }
});

// Tek Demirbaş Detayı ve QR Kodu
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assetId = String(req.params.id);
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        category: true,
        currentUser: {
          select: { id: true, fullName: true, email: true, department: true, phone: true },
        },
        custodyLogs: {
          orderBy: { actionDate: 'desc' },
          include: {
            user: { select: { fullName: true, department: true } },
            performedBy: { select: { fullName: true } },
          },
        },
      },
    });

    if (!asset) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    // QR Kod verisi oluştur (Asset Tag + ID ile hızlı doğrulama yükü)
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
    res.status(500).json({ message: 'Demirbaş detayı alınamadı.' });
  }
});

// Yeni Demirbaş Ekle (Admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      brand,
      model,
      serialNumber,
      categoryId,
      purchaseDate,
      warrantyEndDate,
      location,
      cost,
      notes,
    } = req.body;

    if (!brand || !model || !serialNumber || !categoryId || !purchaseDate) {
      res.status(400).json({ message: 'Marka, model, seri no, kategori ve alım tarihi zorunludur.' });
      return;
    }

    // Seri No teklik kontrolü
    const existingSn = await prisma.asset.findUnique({
      where: { serialNumber: serialNumber.trim() },
    });

    if (existingSn) {
      res.status(400).json({ message: 'Bu seri numarasına sahip demirbaş zaten kayıtlıdır.' });
      return;
    }

    // Otomatik benzersiz Asset Tag
    const assetTag = await generateNextAssetTag();

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        serialNumber: serialNumber.trim(),
        brand: brand.trim(),
        model: model.trim(),
        categoryId,
        purchaseDate: new Date(purchaseDate),
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
        location: location?.trim() || 'Merkez Depo',
        cost: cost ? parseFloat(cost) : null,
        notes: notes?.trim() || null,
        status: 'AVAILABLE',
      },
      include: {
        category: true,
      },
    });

    // Otomatik QR kod üretimi
    const qrPayload = JSON.stringify({
      tag: asset.assetTag,
      sn: asset.serialNumber,
      id: asset.id,
      brand: asset.brand,
      model: asset.model,
    });
    const qrDataUrl = await generateQrDataUrl(qrPayload);

    res.status(201).json({
      message: 'Demirbaş başarıyla sisteme kaydedildi.',
      asset: {
        ...asset,
        qrDataUrl,
      },
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ message: 'Demirbaş eklenirken hata oluştu.' });
  }
});

// Demirbaş Güncelle (Admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assetId = String(req.params.id);
    const {
      brand,
      model,
      serialNumber,
      categoryId,
      purchaseDate,
      warrantyEndDate,
      location,
      cost,
      notes,
      status,
    } = req.body;

    const existing = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!existing) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    if (serialNumber && serialNumber !== existing.serialNumber) {
      const duplicateSn = await prisma.asset.findUnique({
        where: { serialNumber: serialNumber.trim() },
      });
      if (duplicateSn) {
        res.status(400).json({ message: 'Bu seri numarası başka bir demirbaşa aittir.' });
        return;
      }
    }

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        brand: brand?.trim() ?? existing.brand,
        model: model?.trim() ?? existing.model,
        serialNumber: serialNumber?.trim() ?? existing.serialNumber,
        categoryId: categoryId ?? existing.categoryId,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existing.purchaseDate,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : existing.warrantyEndDate,
        location: location !== undefined ? location : existing.location,
        cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : existing.cost,
        notes: notes !== undefined ? notes : existing.notes,
        status: status ?? existing.status,
      },
      include: {
        category: true,
        currentUser: { select: { fullName: true, department: true } },
      },
    });

    res.json({ message: 'Demirbaş bilgileri güncellendi.', asset: updated });
  } catch (error) {
    res.status(500).json({ message: 'Demirbaş güncellenirken hata oluştu.' });
  }
});

// Demirbaş Sil (Admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assetId = String(req.params.id);
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ message: 'Demirbaş bulunamadı.' });
      return;
    }

    if (asset.status === 'ASSIGNED' || asset.currentUserId) {
      res.status(400).json({
        message: 'Zimmetli olan demirbaşlar silinemez. Lütfen önce zimmeti iade alınız.',
      });
      return;
    }

    await prisma.asset.delete({ where: { id: assetId } });
    res.json({ message: 'Demirbaş başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Demirbaş silinemedi.' });
  }
});

export default router;
