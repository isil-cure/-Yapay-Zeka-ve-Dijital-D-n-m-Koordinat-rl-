import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Role } from '../models.types';

export class UserController {
  /**
   * GET /api/users
   * Tüm kullanıcıları listeler (Zimmetli cihaz sayılarıyla birlikte)
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { fullName: 'asc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          department: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              assignedAssets: true,
              assignmentHistory: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kullanıcı listesi getirilemedi.',
      });
    }
  }

  /**
   * PUT /api/users/:id
   * Kullanıcı güncelleme (Sadece ADMIN)
   */
  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { fullName, department, role } = req.body;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          fullName: fullName ? String(fullName).trim() : undefined,
          department: department ? String(department).trim() : undefined,
          role: role === 'ADMIN' ? Role.ADMIN : role === 'STAFF' ? Role.STAFF : undefined,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          department: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Kullanıcı bilgileri güncellendi.',
        data: updated,
      });
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kullanıcı güncellenemedi.',
      });
    }
  }

  /**
   * DELETE /api/users/:id
   * Kullanıcı silme (Sadece ADMIN)
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      if (req.user?.id === id) {
        res.status(400).json({
          success: false,
          message: 'Kendi aktif yönetici hesabınızı silemezsiniz.',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          assignedAssets: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        return;
      }

      if (user.assignedAssets.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Üzerinde aktif zimmetli demirbaş bulunan personel silinemez. Önce demirbaşları iade alınız.',
        });
        return;
      }

      await prisma.user.delete({ where: { id } });

      res.status(200).json({
        success: true,
        message: `"${user.fullName}" personeli başarıyla silindi.`,
      });
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kullanıcı silinemedi.',
      });
    }
  }
}
