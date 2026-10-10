import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AssetService } from '../services/asset.service';
import { AssetStatus, AssignmentAction, Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AssetController {
  /**
   * POST /api/assets
   * Yeni demirbaş ekleme (otomatik QR kodu üretimi ile)
   */
  static async createAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { assetTag, name, brand, model, serialNumber, purchaseDate, status, assignedToUserId, notes } = req.body;

      if (!name || !brand || !model || !serialNumber || !purchaseDate) {
        res.status(400).json({
          success: false,
          message: 'Lütfen zorunlu alanları eksiksiz doldurun (name, brand, model, serialNumber, purchaseDate).',
        });
        return;
      }

      // Seri numarası benzersizlik kontrolü
      const existingSerial = await prisma.asset.findUnique({
        where: { serialNumber: String(serialNumber).trim() },
      });

      if (existingSerial) {
        res.status(409).json({
          success: false,
          message: `"${serialNumber}" seri numarasına sahip demirbaş zaten kayıtlıdır.`,
        });
        return;
      }

      if (assetTag) {
        const existingTag = await prisma.asset.findUnique({
          where: { assetTag: String(assetTag).trim() },
        });
        if (existingTag) {
          res.status(409).json({
            success: false,
            message: `"${assetTag}" etiket koduna sahip demirbaş zaten mevcuttur.`,
          });
          return;
        }
      }

      const asset = await AssetService.createAsset({
        assetTag: assetTag ? String(assetTag) : undefined,
        name: String(name),
        brand: String(brand),
        model: String(model),
        serialNumber: String(serialNumber),
        purchaseDate,
        status: status as AssetStatus,
        assignedToUserId: assignedToUserId ? String(assignedToUserId) : null,
        notes: notes ? String(notes) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Demirbaş ve QR kodu başarıyla oluşturuldu.',
        data: asset,
      });
    } catch (error: any) {
      console.error('Demirbaş oluşturma hatası:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Demirbaş kaydedilirken hata oluştu.',
      });
    }
  }

  /**
   * GET /api/assets
   * Sayfalama, dinamik arama ve filtreleme
   */
  static async getAssets(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const status = req.query.status as AssetStatus;
      const department = typeof req.query.department === 'string' ? req.query.department.trim() : undefined;

      const where: Prisma.AssetWhereInput = {};

      if (status && Object.values(AssetStatus).includes(status)) {
        where.status = status;
      }

      if (department) {
        where.assignedToUser = {
          department: {
            contains: department,
            mode: 'insensitive',
          },
        };
      }

      if (search) {
        where.OR = [
          { assetTag: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { assignedToUser: { fullName: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const total = await prisma.asset.count({ where });
      const assets = await prisma.asset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedToUser: {
            select: { id: true, fullName: true, email: true, department: true },
          },
          _count: {
            select: { assignmentLogs: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: assets,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Demirbaş listeleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Demirbaş listesi getirilirken hata meydana geldi.',
      });
    }
  }

  /**
   * GET /api/assets/:id
   * Cihaz detayı, zimmetli personel ve zimmet geçmişi
   */
  static async getAssetById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const asset = await prisma.asset.findUnique({
        where: { id },
        include: {
          assignedToUser: {
            select: { id: true, fullName: true, email: true, department: true },
          },
          assignmentLogs: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: { id: true, fullName: true, department: true, email: true },
              },
            },
          },
        },
      });

      if (!asset) {
        res.status(404).json({
          success: false,
          message: 'Belirtilen ID ile demirbaş bulunamadı.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      console.error('Demirbaş detay hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Demirbaş detayı alınamadı.',
      });
    }
  }

  /**
   * GET /api/assets/qr/:assetTag
   * QR Kod ile sorgulama (Etiket bazlı)
   */
  static async getAssetByTag(req: Request, res: Response): Promise<void> {
    try {
      const assetTag = String(req.params.assetTag).trim();

      const asset = await prisma.asset.findUnique({
        where: { assetTag },
        include: {
          assignedToUser: {
            select: { id: true, fullName: true, email: true, department: true },
          },
          assignmentLogs: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: { id: true, fullName: true, department: true, email: true },
              },
            },
          },
        },
      });

      if (!asset) {
        res.status(404).json({
          success: false,
          message: `"${assetTag}" barkodlu demirbaş sistemde bulunamadı.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      console.error('QR etiket sorgu hatası:', error);
      res.status(500).json({
        success: false,
        message: 'QR etiket araması başarısız oldu.',
      });
    }
  }

  /**
   * PUT /api/assets/:id
   * Demirbaş güncelleme
   */
  static async updateAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { name, brand, model, serialNumber, purchaseDate, status, notes } = req.body;

      const current = await prisma.asset.findUnique({ where: { id } });
      if (!current) {
        res.status(404).json({ success: false, message: 'Demirbaş bulunamadı.' });
        return;
      }

      const updateData: Prisma.AssetUpdateInput = {};
      if (name) updateData.name = String(name).trim();
      if (brand) updateData.brand = String(brand).trim();
      if (model) updateData.model = String(model).trim();
      if (serialNumber) updateData.serialNumber = String(serialNumber).trim();
      if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);

      // Durum değişikliği kontrolü
      if (status && status !== current.status) {
        updateData.status = status;
        if (status === AssetStatus.IN_STOCK || status === AssetStatus.SCRAPPED) {
          updateData.assignedToUser = { disconnect: true };
        }

        // Durum değişikliği denetim kaydı
        await prisma.assignmentHistory.create({
          data: {
            assetId: id,
            userId: current.assignedToUserId,
            action: AssignmentAction.STATUS_CHANGE,
            notes: notes || `Durum "${current.status}" iken "${status}" olarak güncellendi.`,
          },
        });
      }

      const updated = await prisma.asset.update({
        where: { id },
        data: updateData,
        include: {
          assignedToUser: {
            select: { id: true, fullName: true, email: true, department: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: 'Demirbaş bilgileri güncellendi.',
        data: updated,
      });
    } catch (error: any) {
      console.error('Demirbaş güncelleme hatası:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Demirbaş güncellenemedi.',
      });
    }
  }

  /**
   * DELETE /api/assets/:id
   * Demirbaş silme (Sadece ADMIN)
   */
  static async deleteAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const asset = await prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        res.status(404).json({ success: false, message: 'Demirbaş bulunamadı.' });
        return;
      }

      if (asset.status === AssetStatus.ACTIVE && asset.assignedToUserId) {
        res.status(400).json({
          success: false,
          message: 'Aktif zimmette olan bir cihaz doğrudan silinemez. Önce zimmet iadesi yapınız.',
        });
        return;
      }

      await prisma.asset.delete({ where: { id } });

      res.status(200).json({
        success: true,
        message: `"${asset.assetTag}" etiketli demirbaş ve ilgili kayıtlar silindi.`,
      });
    } catch (error) {
      console.error('Demirbaş silme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Demirbaş silinirken hata oluştu.',
      });
    }
  }
}
