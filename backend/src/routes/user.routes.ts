import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Tüm kullanıcıları listele (Arama, Departman filtresi)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, department, role } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: String(search) } },
        { email: { contains: String(search) } },
        { department: { contains: String(search) } },
      ];
    }
    if (department) {
      where.department = String(department);
    }
    if (role) {
      where.role = String(role);
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { assignedAssets: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcılar listelenirken hata oluştu.' });
  }
});

// Tek kullanıcı detayı
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        assignedAssets: {
          include: { category: true },
        },
        custodyTarget: {
          orderBy: { actionDate: 'desc' },
          take: 10,
          include: {
            asset: true,
            performedBy: { select: { fullName: true } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı detayı alınamadı.' });
  }
});

// Yeni kullanıcı oluştur (Sadece Admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, department, role, phone } = req.body;

    if (!email || !password || !fullName || !department) {
      res.status(400).json({ message: 'E-posta, parola, ad soyad ve departman zorunludur.' });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      res.status(400).json({ message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        fullName,
        department,
        role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
        phone: phone || null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı oluşturulurken sunucu hatası oluştu.' });
  }
});

// Kullanıcı güncelle (Sadece Admin)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.id);
    const { fullName, department, role, phone, isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName ?? user.fullName,
        department: department ?? user.department,
        role: role ?? user.role,
        phone: phone !== undefined ? phone : user.phone,
        isActive: isActive !== undefined ? Boolean(isActive) : user.isActive,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        department: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    res.json({ message: 'Kullanıcı bilgileri güncellendi.', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı güncellenemedi.' });
  }
});

// Admin tarafından şifre sıfırlama
router.put('/:id/reset-password', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'Yeni parola en az 6 karakter olmalıdır.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Kullanıcı parolası başarıyla sıfırlandı.' });
  } catch (error) {
    res.status(500).json({ message: 'Parola sıfırlanırken hata oluştu.' });
  }
});

// Kullanıcı silme (Sadece Admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.id);
    // Kendi hesabını silmeye çalışıyorsa engelle
    if (req.user!.id === userId) {
      res.status(400).json({ message: 'Yönetici kendi hesabını silemez.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { assignedAssets: true },
    });

    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

    if (user.assignedAssets.length > 0) {
      res.status(400).json({
        message: `Bu kullanıcının üzerinde zimmetli ${user.assignedAssets.length} adet cihaz bulunmaktadır. Lütfen önce zimmetleri iade alınız veya kullanıcıyı pasif duruma getiriniz.`,
      });
      return;
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Kullanıcı başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı silinemedi. İlişkili kayıtlar bulunuyor olabilir.' });
  }
});

export default router;
