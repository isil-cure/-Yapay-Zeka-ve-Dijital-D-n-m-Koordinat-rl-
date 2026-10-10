import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import assetRoutes from './routes/asset.routes';
import custodyRoutes from './routes/custody.routes';
import dashboardRoutes from './routes/dashboard.routes';
import qrRoutes from './routes/qr.routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Lokal ve konteyner erişimleri için esnek
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sağlık kontrolü
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'IT Demirbaş ve Zimmet Yönetim Sistemi API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/custody', custodyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/qr', qrRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API Uç Noktası Bulunamadı: ${req.method} ${req.originalUrl}` });
});

// Global Hata Yakalama
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Sunucuda beklenmeyen bir hata oluştu.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 IT Demirbaş & Zimmet API Servisi Çalışıyor!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
