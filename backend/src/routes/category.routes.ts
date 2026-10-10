import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Kategorileri listele
router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Kategoriler listelenirken hata oluştu.' });
  }
});

// Yeni kategori oluştur (Admin)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, icon } = req.body;
    if (!name || !code) {
      res.status(400).json({ message: 'Kategori adı ve kodu zorunludur.' });
      return;
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { code: code.toUpperCase() }],
      },
    });

    if (existing) {
      res.status(400).json({ message: 'Bu ad veya koda sahip kategori zaten mevcut.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        code: code.toUpperCase(),
        icon: icon || 'Box',
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Kategori oluşturulamadı.' });
  }
});

export default router;
