import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import assetRoutes from './routes/asset.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import { prisma } from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Yapılandırması
app.use(
  cors({
    origin: '*', // Kurumsal kullanım ve Docker ortamında esnek erişim
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sağlık Kontrolü (Health Check)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Veritabanı canlılık testi
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'UP',
      service: 'TOGU IT Demirbaş ve Zimmet Yönetim Sistemi API',
      timestamp: new Date().toISOString(),
      database: 'Connected',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'DEGRADED',
      service: 'TOGU IT Demirbaş ve Zimmet Yönetim Sistemi API',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message,
    });
  }
});

// RESTful API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// 404 Bilinmeyen Rota Yakalayıcı
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'İstenen API uç noktası bulunamadı.',
  });
});

// Global Hata Yakalayıcı (Global Error Handler)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Sunucu tarafında beklenmeyen bir hata oluştu.',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 TOGU IT Demirbaş ve Zimmet Yönetim Sistemi API Başlatıldı`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 API Uç Noktası: http://localhost:${PORT}/api`);
  console.log(`🎓 Tokat Gaziosmanpaşa Üniversitesi - Aday Mühendis Projesi`);
  console.log(`👩‍💻 Geliştirici: Işıl Cüre`);
  console.log(`=======================================================`);
});

export default app;
