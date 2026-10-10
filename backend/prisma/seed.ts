import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

// Hem PostgreSQL Enumu hem SQLite String uyumluluğu
const Role = { ADMIN: 'ADMIN', STAFF: 'STAFF' } as const;
const AssetStatus = {
  ACTIVE: 'ACTIVE',
  IN_STOCK: 'IN_STOCK',
  IN_REPAIR: 'IN_REPAIR',
  SCRAPPED: 'SCRAPPED',
} as const;
const AssignmentAction = {
  ASSIGN: 'ASSIGN',
  RETURN: 'RETURN',
  STATUS_CHANGE: 'STATUS_CHANGE',
} as const;

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Veritabanı tohumlama (seed) işlemi başlatılıyor...');

  // 1. Temizleme
  await prisma.assignmentHistory.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  // 2. Kullanıcılar
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const staffPasswordHash = await bcrypt.hash('personel123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@gop.edu.tr',
      passwordHash: adminPasswordHash,
      fullName: 'Işıl Cüre (Admin)',
      department: 'Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü',
      role: Role.ADMIN,
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      email: 'personel@gop.edu.tr',
      passwordHash: staffPasswordHash,
      fullName: 'Ahmet Yılmaz',
      department: 'Bilgi İşlem Daire Başkanlığı',
      role: Role.STAFF,
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      email: 'mehmet.kaya@gop.edu.tr',
      passwordHash: staffPasswordHash,
      fullName: 'Mehmet Kaya',
      department: 'Yazılım ve Yapay Zeka AR-GE',
      role: Role.STAFF,
    },
  });

  console.log('✅ Kullanıcılar oluşturuldu (1 Admin, 2 Personel)');

  // 3. Demirbaş Listesi
  const rawAssets = [
    {
      assetTag: 'TOGU-2026-001',
      name: 'ThinkPad P16 Gen 2 Mobil İş İstasyonu',
      brand: 'Lenovo',
      model: 'ThinkPad P16 (i9 / 64GB / RTX 4080)',
      serialNumber: 'LN-P16-99210-TR',
      purchaseDate: new Date('2024-03-15'),
      status: AssetStatus.ACTIVE,
      assignedToUserId: staffUser2.id,
      notes: 'Yapay Zeka LLM fine-tuning ve veri analizi projeleri için tahsis edildi.',
    },
    {
      assetTag: 'TOGU-2026-002',
      name: 'MacBook Pro 16 M3 Max',
      brand: 'Apple',
      model: 'MacBook Pro 16" (16-Core CPU, 40-Core GPU, 48GB)',
      serialNumber: 'AP-MBP16-M3X-774',
      purchaseDate: new Date('2024-02-10'),
      status: AssetStatus.ACTIVE,
      assignedToUserId: staffUser1.id,
      notes: 'Sistem mimarisi ve iOS / Cross-platform servis geliştirme amaçlı tahsis.',
    },
    {
      assetTag: 'TOGU-2026-003',
      name: 'PowerEdge R750xs Rack Sunucu',
      brand: 'Dell',
      model: 'PowerEdge R750xs (2x Intel Xeon Silver, 128GB RAM)',
      serialNumber: 'DL-R750-SVC-8841',
      purchaseDate: new Date('2023-11-20'),
      status: AssetStatus.IN_STOCK,
      assignedToUserId: null,
      notes: 'TOGU Veri Merkezi Sistem Odası Kabin A3 için yedek depoda tutuluyor.',
    },
    {
      assetTag: 'TOGU-2026-004',
      name: 'Catalyst 9300 48-Port PoE+ Ağ Anahtarı',
      brand: 'Cisco',
      model: 'C9300-48P-A Gigabit Switch',
      serialNumber: 'CS-C9300-48P-9902',
      purchaseDate: new Date('2023-09-05'),
      status: AssetStatus.IN_STOCK,
      assignedToUserId: null,
      notes: 'Rektörlük B Binası omurga ağ genişletmesi için hazırda tutulmaktadır.',
    },
    {
      assetTag: 'TOGU-2026-005',
      name: 'UltraSharp U3223QE 4K Hub Monitör',
      brand: 'Dell',
      model: 'U3223QE 31.5" 4K IPS Black USB-C Hub',
      serialNumber: 'DL-U3223-90112-TR',
      purchaseDate: new Date('2024-04-01'),
      status: AssetStatus.ACTIVE,
      assignedToUserId: staffUser2.id,
      notes: 'Yüksek çözünürlüklü arayüz ve grafik tasarım işleri için zimmetlendi.',
    },
    {
      assetTag: 'TOGU-2026-006',
      name: 'ProLiant DL380 Gen10 Plus Sunucu',
      brand: 'HPE',
      model: 'DL380 Gen10 Plus 8SFF (2x Xeon Gold, 256GB RAM)',
      serialNumber: 'HP-DL380-G10-664',
      purchaseDate: new Date('2023-08-14'),
      status: AssetStatus.IN_STOCK,
      assignedToUserId: null,
      notes: 'Sanallaştırma kümesi yedek node olarak depoda bekletiliyor.',
    },
    {
      assetTag: 'TOGU-2026-007',
      name: 'Latitude 5540 Kurumsal Dizüstü Bilgisayar',
      brand: 'Dell',
      model: 'Latitude 5540 (i7-1365U / 16GB / 512GB)',
      serialNumber: 'DL-LAT5540-10492',
      purchaseDate: new Date('2023-05-18'),
      status: AssetStatus.IN_REPAIR,
      assignedToUserId: null,
      notes: 'Anakart şarj devresi arızası nedeniyle yetkili teknik serviste işlem görüyor.',
    },
    {
      assetTag: 'TOGU-2026-008',
      name: 'ThinkVision P27h-30 QHD Monitör',
      brand: 'Lenovo',
      model: 'P27h-30 27" QHD IPS Type-C Dock',
      serialNumber: 'LN-TVP27-00912-SC',
      purchaseDate: new Date('2021-01-10'),
      status: AssetStatus.SCRAPPED,
      assignedToUserId: null,
      notes: 'Panel kırılması ve onarım maliyetinin cihaz değerini aşması nedeniyle hurdaya ayrıldı.',
    },
  ];

  for (const item of rawAssets) {
    const qrDataUrl = await QRCode.toDataURL(item.assetTag, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e3a8a', // TOGU Koyu Mavi
        light: '#ffffff',
      },
    });

    const asset = await prisma.asset.create({
      data: {
        assetTag: item.assetTag,
        name: item.name,
        brand: item.brand,
        model: item.model,
        serialNumber: item.serialNumber,
        purchaseDate: item.purchaseDate,
        status: item.status,
        qrCode: qrDataUrl,
        assignedToUserId: item.assignedToUserId,
      },
    });

    // Zimmet Geçmişi Kaydı (AssignmentHistory)
    if (item.status === AssetStatus.ACTIVE && item.assignedToUserId) {
      await prisma.assignmentHistory.create({
        data: {
          assetId: asset.id,
          userId: item.assignedToUserId,
          action: AssignmentAction.ASSIGN,
          notes: item.notes,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 gün önce
        },
      });
    } else if (item.status === AssetStatus.IN_REPAIR) {
      await prisma.assignmentHistory.create({
        data: {
          assetId: asset.id,
          userId: null,
          action: AssignmentAction.STATUS_CHANGE,
          notes: item.notes,
        },
      });
    } else if (item.status === AssetStatus.SCRAPPED) {
      await prisma.assignmentHistory.create({
        data: {
          assetId: asset.id,
          userId: null,
          action: AssignmentAction.STATUS_CHANGE,
          notes: item.notes,
        },
      });
    } else {
      await prisma.assignmentHistory.create({
        data: {
          assetId: asset.id,
          userId: null,
          action: AssignmentAction.STATUS_CHANGE,
          notes: 'Envanter girişi yapıldı ve depoya alındı.',
        },
      });
    }
  }

  console.log('✅ 8 adet gerçekçi TOGU demirbaşı ve QR kodları oluşturuldu');
  console.log('🎉 Tohumlama (seed) başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Tohumlama hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
