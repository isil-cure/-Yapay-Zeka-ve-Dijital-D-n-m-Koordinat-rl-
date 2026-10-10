import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'togu-jwt-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthController {
  /**
   * POST /api/auth/login
   * Kullanıcı girişi ve JWT üretimi
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'E-posta ve şifre zorunludur.',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Geçersiz e-posta veya şifre.',
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Geçersiz e-posta veya şifre.',
        });
        return;
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        department: user.department,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: '24h',
      } as jwt.SignOptions);

      res.status(200).json({
        success: true,
        message: 'Giriş başarılı.',
        token,
        user: tokenPayload,
      });
    } catch (error) {
      console.error('Login hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Giriş işlemi sırasında sunucu hatası oluştu.',
      });
    }
  }

  /**
   * POST /api/auth/register
   * Yalnızca ADMIN yetkisindeki kullanıcılar yeni personel ekleyebilir.
   */
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password, fullName, department, role } = req.body;

      if (!email || !password || !fullName || !department) {
        res.status(400).json({
          success: false,
          message: 'Tüm alanların doldurulması zorunludur (email, password, fullName, department).',
        });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.',
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: fullName.trim(),
          department: department.trim(),
          role: role === 'ADMIN' ? Role.ADMIN : Role.STAFF,
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

      res.status(201).json({
        success: true,
        message: 'Yeni personel başarıyla kaydedildi.',
        user: newUser,
      });
    } catch (error) {
      console.error('Kayıt hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kullanıcı kaydı sırasında sunucu hatası oluştu.',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Oturum açan kullanıcının profilini döner.
   */
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Yetkilendirme gerekli.',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          department: true,
          role: true,
          createdAt: true,
          assignedAssets: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              brand: true,
              model: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Profil bilgileri alınamadı.',
      });
    }
  }
}
