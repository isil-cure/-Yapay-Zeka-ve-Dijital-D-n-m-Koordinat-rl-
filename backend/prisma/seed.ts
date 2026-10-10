import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı tohumlama başlatılıyor...');

  // Temizlik
  await prisma.custodyLog.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Şifreler
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const staffPassword = await bcrypt.hash('Personel123!', 10);

  // Kullanıcılar
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kurum.gov.tr',
      password: adminPassword,
      fullName: 'Gökhan Yıldırım',
      department: 'Bilgi İşlem ve Dijital Dönüşüm',
      role: 'ADMIN',
      phone: '+90 532 100 0001',
      isActive: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'ahmet.yilmaz@kurum.gov.tr',
      password: staffPassword,
      fullName: 'Ahmet Yılmaz',
      department: 'Yazılım ve Yapay Zeka',
      role: 'STAFF',
      phone: '+90 533 200 0002',
      isActive: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'ayse.demir@kurum.gov.tr',
      password: staffPassword,
      fullName: 'Ayşe Demir',
      department: 'Veri Analitiği ve İş Zekası',
      role: 'STAFF',
      phone: '+90 534 300 0003',
      isActive: true,
    },
  });

  const staff3 = await prisma.user.create({
    data: {
      email: 'mehmet.kaya@kurum.gov.tr',
      password: staffPassword,
      fullName: 'Mehmet Kaya',
      department: 'Sistem ve Ağ Güvenliği',
      role: 'STAFF',
      phone: '+90 535 400 0004',
      isActive: true,
    },
  });

  const staff4 = await prisma.user.create({
    data: {
      email: 'zeynep.celik@kurum.gov.tr',
      password: staffPassword,
      fullName: 'Zeynep Çelik',
      department: 'İnsan Kaynakları Koordinatörlüğü',
      role: 'STAFF',
      phone: '+90 536 500 0005',
      isActive: true,
    },
  });

  console.log('✅ Kullanıcılar oluşturuldu.');

  // Kategoriler
  const catLaptop = await prisma.category.create({
    data: { name: 'Dizüstü Bilgisayar', code: 'LAP', icon: 'Laptop' },
  });
  const catDesktop = await prisma.category.create({
    data: { name: 'Masaüstü Bilgisayar', code: 'DSK', icon: 'Monitor' },
  });
  const catServer = await prisma.category.create({
    data: { name: 'Sunucu ve Veri Depolama', code: 'SRV', icon: 'Server' },
  });
  const catMonitor = await prisma.category.create({
    data: { name: 'Monitör ve Ekran', code: 'MON', icon: 'Tv' },
  });
  const catNetwork = await prisma.category.create({
    data: { name: 'Ağ ve Güvenlik Cihazı', code: 'NET', icon: 'Network' },
  });
  const catPrinter = await prisma.category.create({
    data: { name: 'Yazıcı ve Tarayıcı', code: 'PRN', icon: 'Printer' },
  });

  console.log('✅ Kategoriler oluşturuldu.');

  // Demirbaşlar & Zimmetler
  const asset1 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0001',
      serialNumber: 'C02G90XXMD6M',
      brand: 'Apple',
      model: 'MacBook Pro 16" M3 Max 36GB',
      categoryId: catLaptop.id,
      purchaseDate: new Date('2025-01-15'),
      warrantyEndDate: new Date('2028-01-15'),
      status: 'ASSIGNED',
      location: 'Yazılım Ofisi - Masa 14',
      cost: 115000,
      notes: 'Yapay zeka modeli geliştirme ve kodlama için tahsis edildi.',
      currentUserId: staff1.id,
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0002',
      serialNumber: 'DL-XPS-9530-991',
      brand: 'Dell',
      model: 'XPS 15 9530 i7-13700H 32GB',
      categoryId: catLaptop.id,
      purchaseDate: new Date('2025-02-10'),
      warrantyEndDate: new Date('2028-02-10'),
      status: 'ASSIGNED',
      location: 'Veri Analitiği Ofisi - Masa 06',
      cost: 72000,
      notes: 'Veri analitiği ve dashboard çalışmaları için verildi.',
      currentUserId: staff2.id,
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0003',
      serialNumber: 'PF-4X990A-LN',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 4 Ryzen 7',
      categoryId: catLaptop.id,
      purchaseDate: new Date('2025-03-01'),
      warrantyEndDate: new Date('2028-03-01'),
      status: 'AVAILABLE',
      location: 'Merkez IT Depo - Raf A1',
      cost: 48000,
      notes: 'Yedek personel cihazı olarak hazır bekliyor.',
    },
  });

  const asset4 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0004',
      serialNumber: 'HP-ZBK-88210',
      brand: 'HP',
      model: 'ZBook Studio G9 i9-12900HK',
      categoryId: catLaptop.id,
      purchaseDate: new Date('2024-11-20'),
      warrantyEndDate: new Date('2027-11-20'),
      status: 'AVAILABLE',
      location: 'Merkez IT Depo - Raf A2',
      cost: 65000,
      notes: 'Yüksek performanslı yedek iş istasyonu.',
    },
  });

  const asset5 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0005',
      serialNumber: 'SRV-R750-88002',
      brand: 'Dell',
      model: 'PowerEdge R750 2x Xeon 256GB',
      categoryId: catServer.id,
      purchaseDate: new Date('2024-06-12'),
      warrantyEndDate: new Date('2029-06-12'),
      status: 'AVAILABLE',
      location: 'Veri Merkezi - Kabinet B04',
      cost: 380000,
      notes: 'Kurumsal yapay zeka çıkarım sunucusu.',
    },
  });

  const asset6 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0006',
      serialNumber: 'DELL-U2723QE-01',
      brand: 'Dell',
      model: 'UltraSharp U2723QE 27" 4K IPS',
      categoryId: catMonitor.id,
      purchaseDate: new Date('2025-01-15'),
      warrantyEndDate: new Date('2028-01-15'),
      status: 'ASSIGNED',
      location: 'Yazılım Ofisi - Masa 14',
      cost: 24000,
      notes: 'Çift monitör kurulumu için verildi.',
      currentUserId: staff1.id,
    },
  });

  const asset7 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0007',
      serialNumber: 'LG-34WN80C-77',
      brand: 'LG',
      model: '34WN80C-B 34" Ultrawide Curved',
      categoryId: catMonitor.id,
      purchaseDate: new Date('2025-02-15'),
      warrantyEndDate: new Date('2027-02-15'),
      status: 'AVAILABLE',
      location: 'Merkez IT Depo - Raf M2',
      cost: 19500,
      notes: 'Kullanıma hazır geniş ekran monitör.',
    },
  });

  const asset8 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0008',
      serialNumber: 'CSCO-C9200-48P-09',
      brand: 'Cisco',
      model: 'Catalyst 9200 48-Port PoE+',
      categoryId: catNetwork.id,
      purchaseDate: new Date('2024-04-10'),
      warrantyEndDate: new Date('2029-04-10'),
      status: 'AVAILABLE',
      location: 'Sistem Odası Ağ Kabini 2',
      cost: 110000,
      notes: 'Ağ altyapı omurga anahtarı.',
    },
  });

  const asset9 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0009',
      serialNumber: 'HP-LJ-M608-ERR',
      brand: 'HP',
      model: 'LaserJet Enterprise M608x',
      categoryId: catPrinter.id,
      purchaseDate: new Date('2023-08-20'),
      warrantyEndDate: new Date('2025-08-20'),
      status: 'IN_REPAIR',
      location: 'Yetkili Servis (Toner/Fırın Arızası)',
      cost: 32000,
      notes: 'Fırın ünitesinde mekanik ses ve kağıt sıkışması bildirildi, servise gönderildi.',
    },
  });

  const asset10 = await prisma.asset.create({
    data: {
      assetTag: 'AST-2026-0010',
      serialNumber: 'LN-TC-M70Q-OLD',
      brand: 'Lenovo',
      model: 'ThinkCentre M70q Gen 1 i5-10400T',
      categoryId: catDesktop.id,
      purchaseDate: new Date('2020-05-10'),
      warrantyEndDate: new Date('2023-05-10'),
      status: 'SCRAPPED',
      location: 'Hurda / Geri Dönüşüm Alanı',
      cost: 12000,
      notes: 'Anakart yanması sonucu onarım maliyeti yüksek bulunduğundan hurdaya ayrıldı.',
    },
  });

  console.log('✅ Demirbaşlar oluşturuldu.');

  // Zimmet Tarihçe Kayıtları (Custody Logs)
  await prisma.custodyLog.create({
    data: {
      assetId: asset1.id,
      userId: staff1.id,
      performedById: admin.id,
      actionType: 'ASSIGN',
      notes: 'Yazılım ekibi yapay zeka geliştirme için sıfır kutusunda teslim edildi.',
      documentNo: 'ZMT-2026-001',
      actionDate: new Date('2025-01-16'),
    },
  });

  await prisma.custodyLog.create({
    data: {
      assetId: asset6.id,
      userId: staff1.id,
      performedById: admin.id,
      actionType: 'ASSIGN',
      notes: 'Çift ekran çalışma desteği için monitör teslimi yapıldı.',
      documentNo: 'ZMT-2026-002',
      actionDate: new Date('2025-01-16'),
    },
  });

  await prisma.custodyLog.create({
    data: {
      assetId: asset2.id,
      userId: staff2.id,
      performedById: admin.id,
      actionType: 'ASSIGN',
      notes: 'Veri analitiği departmanı iş istasyonu teslimi.',
      documentNo: 'ZMT-2026-003',
      actionDate: new Date('2025-02-11'),
    },
  });

  await prisma.custodyLog.create({
    data: {
      assetId: asset9.id,
      performedById: admin.id,
      actionType: 'REPAIR_SENT',
      notes: 'Fırın ünitesi mekanik arızası sebebiyle HP Yetkili Servise sevk edildi.',
      documentNo: 'SRV-2026-044',
      actionDate: new Date('2026-03-01'),
    },
  });

  await prisma.custodyLog.create({
    data: {
      assetId: asset10.id,
      performedById: admin.id,
      actionType: 'SCRAP',
      notes: 'Teknik heyet kararıyla kullanım ömrünü tamamlamış cihaz hurdaya ayrılmıştır.',
      documentNo: 'HRD-2026-012',
      actionDate: new Date('2026-02-15'),
    },
  });

  console.log('✅ Zimmet geçmişi ve denetim logları oluşturuldu.');
  console.log('🚀 Tohumlama başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
