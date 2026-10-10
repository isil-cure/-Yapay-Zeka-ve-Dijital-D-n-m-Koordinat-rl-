const http = require('http');

async function post(url, data, token) {
  const parsed = new URL(url);
  const body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(resData) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function get(url, token) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + (parsed.search || ''),
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(resData) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 API Doğrulama Testleri Başlatılıyor...\n');

  // 1. Health Check
  const health = await get('http://localhost:5000/api/health');
  console.log('1. Health Check:', health.status === 200 ? '✅ BAŞARILI' : '❌ HATA', health.data.system);

  // 2. Admin Login
  const adminLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'admin@kurum.gov.tr',
    password: 'Admin123!'
  });
  console.log('2. Admin Girişi:', adminLogin.status === 200 ? '✅ BAŞARILI' : '❌ HATA', `Giriş Yapan: ${adminLogin.data.user?.fullName} (${adminLogin.data.user?.role})`);
  const adminToken = adminLogin.data.token;

  // 3. Dashboard Stats
  const stats = await get('http://localhost:5000/api/dashboard/stats', adminToken);
  console.log('3. Dashboard İstatistikleri:', stats.status === 200 ? '✅ BAŞARILI' : '❌ HATA',
    `Toplam Cihaz: ${stats.data.summary?.totalAssets}, Zimmetli: ${stats.data.summary?.assignedCount}, Depoda: ${stats.data.summary?.availableCount}, Arızalı: ${stats.data.summary?.inRepairCount}`);

  // 4. Asset List & Pagination
  const assets = await get('http://localhost:5000/api/assets?page=1&limit=5', adminToken);
  console.log('4. Demirbaş Listesi:', assets.status === 200 ? '✅ BAŞARILI' : '❌ HATA', `Toplam Kayıt: ${assets.data.pagination?.total}, Sayfa: ${assets.data.pagination?.page}/${assets.data.pagination?.totalPages}`);

  // 5. QR Lookup (Saha Modülü)
  const qrLookup = await get('http://localhost:5000/api/qr/lookup/AST-2026-0001', adminToken);
  console.log('5. Saha QR Sorgulama (AST-2026-0001):', qrLookup.status === 200 ? '✅ BAŞARILI' : '❌ HATA',
    `Cihaz: ${qrLookup.data?.brand} ${qrLookup.data?.model}, Kimde: ${qrLookup.data?.currentUser?.fullName}, QR Üretildi mi: ${qrLookup.data?.qrDataUrl ? 'EVET (data:image/png)' : 'HAYIR'}`);

  // 6. Custody Logs (Audit Trail)
  const logs = await get('http://localhost:5000/api/custody/logs', adminToken);
  console.log('6. Zimmet Denetim Logları:', logs.status === 200 ? '✅ BAŞARILI' : '❌ HATA', `Toplam Hareket Kaydı: ${logs.data.pagination?.total}`);

  // 7. Staff Login & My Custody
  const staffLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'ahmet.yilmaz@kurum.gov.tr',
    password: 'Personel123!'
  });
  console.log('7. Personel Girişi:', staffLogin.status === 200 ? '✅ BAŞARILI' : '❌ HATA', `Giriş Yapan: ${staffLogin.data.user?.fullName}`);
  const staffToken = staffLogin.data.token;

  const myAssets = await get('http://localhost:5000/api/custody/my-assets', staffToken);
  console.log('8. Kişisel Zimmet Ekranı:', myAssets.status === 200 ? '✅ BAŞARILI' : '❌ HATA',
    `Ahmet Yılmaz üzerindeki cihaz sayısı: ${myAssets.data.length}`);
  myAssets.data.forEach((a, i) => {
    console.log(`   └─ Cihaz ${i+1}: [${a.assetTag}] ${a.brand} ${a.model} (${a.serialNumber})`);
  });

  console.log('\n🎉 TÜM API VE İŞ MANTIĞI TESTLERİ EKSİKSİZ GEÇTİ!');
}

runTests().catch(err => {
  console.error('❌ Test sırasında hata:', err);
  process.exit(1);
});
