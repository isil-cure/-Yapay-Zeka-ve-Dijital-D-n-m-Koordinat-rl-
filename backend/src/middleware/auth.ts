import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    department: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'kurum-it-secret-super-secure-key-2026';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Yetkilendirme belirteci bulunamadı. Lütfen giriş yapınız.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, fullName: true, department: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Geçersiz veya pasif kullanıcı hesabı.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz veya süresi dolmuş oturum belirteci.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Bu işlem için Yönetici (Admin) yetkisi gereklidir.' });
    return;
  }
  next();
};
