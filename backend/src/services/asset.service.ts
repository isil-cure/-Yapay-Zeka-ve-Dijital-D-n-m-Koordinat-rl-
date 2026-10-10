import { prisma } from '../prisma';
import { AssetStatus, AssignmentAction } from '@prisma/client';
import { QrService } from './qr.service';

export interface CreateAssetInput {
  assetTag?: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string | Date;
  status?: AssetStatus;
  assignedToUserId?: string | null;
  notes?: string;
}

export class AssetService {
  /**
   * Otomatik benzersiz etiket üretici (örn: TOGU-2026-009)
   */
  static async generateNextAssetTag(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.asset.count();
    const sequence = String(count + 1).padStart(3, '0');
    return `TOGU-${year}-${sequence}`;
  }

  /**
   * Yeni demirbaş kaydı oluşturur ve otomatik QR kodunu üretir.
   */
  static async createAsset(data: CreateAssetInput) {
    const assetTag = data.assetTag?.trim() || (await this.generateNextAssetTag());

    // QR kodu otomatik üret
    const qrCode = await QrService.generateQrDataUrl(assetTag);

    // Durum ve kullanıcı ataması kontrolü
    let status = data.status || AssetStatus.IN_STOCK;
    if (data.assignedToUserId) {
      status = AssetStatus.ACTIVE;
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name: data.name.trim(),
        brand: data.brand.trim(),
        model: data.model.trim(),
        serialNumber: data.serialNumber.trim(),
        purchaseDate: new Date(data.purchaseDate),
        status,
        qrCode,
        assignedToUserId: data.assignedToUserId || null,
      },
      include: {
        assignedToUser: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
    });

    // İlk denetim izi / hareket kaydı
    await prisma.assignmentHistory.create({
      data: {
        assetId: asset.id,
        userId: data.assignedToUserId || null,
        action: data.assignedToUserId ? AssignmentAction.ASSIGN : AssignmentAction.STATUS_CHANGE,
        notes: data.notes || (data.assignedToUserId ? 'İlk zimmet kaydı ile oluşturuldu.' : 'Envantere yeni giriş yapıldı.'),
      },
    });

    return asset;
  }

  /**
   * Demirbaşı personele zimmetle (Cihaz durumu ACTIVE olur ve log atılır).
   */
  static async assignAsset(assetId: string, userId: string, notes?: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Demirbaş bulunamadı.');
    }

    if (asset.status === AssetStatus.SCRAPPED) {
      throw new Error('Hurdaya ayrılmış bir demirbaş personele zimmetlenemez.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Zimmetlenecek personel bulunamadı.');
    }

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedToUserId: userId,
        status: AssetStatus.ACTIVE,
      },
      include: {
        assignedToUser: {
          select: { id: true, fullName: true, email: true, department: true },
        },
      },
    });

    // Zimmet logu oluştur
    await prisma.assignmentHistory.create({
      data: {
        assetId,
        userId,
        action: AssignmentAction.ASSIGN,
        notes: notes || `Demirbaş ${user.fullName} (${user.department}) personeline zimmetlendi.`,
      },
    });

    return updated;
  }

  /**
   * Demirbaşı personelden iade al (Cihaz durumu IN_STOCK olur ve log atılır).
   */
  static async returnAsset(assetId: string, notes?: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        assignedToUser: true,
      },
    });

    if (!asset) {
      throw new Error('Demirbaş bulunamadı.');
    }

    const previousUserId = asset.assignedToUserId;
    const previousUserName = asset.assignedToUser?.fullName || 'Personel';

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedToUserId: null,
        status: AssetStatus.IN_STOCK,
      },
      include: {
        assignedToUser: true,
      },
    });

    // İade logu oluştur
    await prisma.assignmentHistory.create({
      data: {
        assetId,
        userId: previousUserId,
        action: AssignmentAction.RETURN,
        notes: notes || `Demirbaş ${previousUserName} tarafından iade alındı ve depoya kaldırıldı.`,
      },
    });

    return updated;
  }
}
