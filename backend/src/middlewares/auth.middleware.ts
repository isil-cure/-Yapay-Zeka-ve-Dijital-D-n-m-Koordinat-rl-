import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../models.types';

const JWT_SECRET = process.env.JWT_SECRET || 'togu-jwt-secret-key-2026';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  department: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

/**
 * JWT Doğrulama Middleware'i
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Yetkilendirme hatası: JWT token bulunamadı. Lütfen giriş yapın.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token.',
    });
    return;
  }
};

/**
 * Rol Bazlı Yetkilendirme Middleware'i (RBAC)
 */
export const requireRole = (allowedRoles: (Role | string)[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı kimliği doğrulanmadı.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmamaktadır (Yalnızca Admin erişebilir).',
      });
      return;
    }

    next();
  };
};
