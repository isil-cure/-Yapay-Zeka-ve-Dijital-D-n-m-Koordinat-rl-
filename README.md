# IT Demirbaş ve Zimmet Yönetim Sistemi
### T.C. Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü — Aday Mühendis Değerlendirme Projesi

Bu proje, kurum bünyesindeki bilişim donanımlarının (bilgisayar, sunucu, monitör, ağ cihazı, yazıcı vb.) sisteme kaydedildiği, her birine **otomatik benzersiz QR Kod/Barkod** üretildiği, cihaz durumlarının anlık izlendiği, personellere zimmetlendiği ve **mobil kamera ile sahada anında QR taranarak işlem yapılabildiği** uçtan uca modern bir Full-Stack web ve saha yönetim platformudur.

---

## 📸 Temel Ekranlar ve Özellikler

1. **Gösterge Paneli (Dashboard):**
   - Toplam cihaz sayısı, depoda/boşta bekleyen cihazlar, personele zimmetli cihazlar ve teknik servisteki/arızalı cihazların canlı KPI sayaçları.
   - Cihaz kategorilerine ve departmanlara göre grafiksel dağılım.
   - Son zimmet ve servis hareketlerinin anlık akışı.

2. **Demirbaş ve Envanter Yönetimi:**
   - Marka, Model, Seri No, Alım Tarihi, Garanti, Maliyet ve Konum bilgileriyle donanım ekleme/düzenleme/silme.
   - Her cihaza benzersiz otomatik `AST-YYYY-XXXX` kodu ve QR kod üretimi.
   - Yazdırılabilir ve indirilebilir kurumsal **QR Kod & Barkod Etiketi**.
   - Duruma, kategoriye, departmana ve anahtar kelimelere göre anlık çok kriterli filtreleme & sayfalama (Pagination).

3. **Zimmet Yönetimi ve Denetim Tarihçesi (Audit Trail):**
   - Personele cihaz zimmetleme (Teslim tutanak numarası ve açıklamasıyla).
   - Zimmetten iade alma (Depoya geri çekme veya doğrudan servise/hurdaya yönlendirme).
   - Geriye dönük kim, ne zaman teslim aldı/iade etti loglarının tutulduğu eksiksiz denetim tarihçesi.

4. **Kişisel Zimmet Ekranı (Personel Portalı):**
   - Giriş yapan personelin kendi üzerine zimmetli tüm donanımları görüntüleyebilmesi.
   - Tek tıkla resmi **"Bilişim Teknolojileri Donanım ve Zimmet Teslim Tutanağı"** yazdırma şablonu.
   - Personelin kendi cihazı için arıza bildiriminde bulunabilmesi.

5. **Mobil Saha Yönetimi & Canlı Kamera QR Tarayıcı (Bonus İster):**
   - Cihaz kamerası (veya web kamerası) ile donanım üzerindeki QR kodun sahada canlı taranması.
   - Taranan cihazın durumunun ve kime ait olduğunun anında ekrana gelmesi.
   - Sahada tek tıkla **"Personele Teslim Et"**, **"Geri Kabul Et"** veya **"Arıza Durumu Bildir"** hızlı aksiyonları.

6. **Kullanıcı ve Rol Yönetimi (RBAC):**
   - Admin ve Standart Personel yetkilendirmesi.
   - Yöneticilerin yeni kullanıcı ekleme, düzenleme, silme ve şifre sıfırlama paneli.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Backend:** Node.js, Express.js, TypeScript
- **Veritabanı & ORM:** Prisma ORM, SQLite (sıfır konfigürasyon lokal başlangıç) / PostgreSQL (Docker uyumlu)
- **Güvenlik & Yetkilendirme:** JWT (JSON Web Tokens), bcryptjs parola hashleme, RBAC (Role-Based Access Control)
- **QR Kod Servisi:** `qrcode` (otomatik benzersiz veri yükü ve PNG üretimi)
- **Frontend:** React 18, TypeScript, Vite
- **Stil & Tasarım Sistemi:** Özel **Vanilla CSS** (Kurallara uygun, Tailwind olmadan saf CSS değişkenleri, cam efekti/glassmorphism, mobil öncelikli responsive grid)
- **Kamera / Saha QR Tarama:** `html5-qrcode`
- **İkonografi:** `lucide-react`
- **DevOps:** Docker, Dockerfile (Multi-stage build), Docker Compose

---

## 👥 Demo Kullanıcı Hesapları

Değerlendirme sürecini kolaylaştırmak adına sisteme giriş ekranında tek tıkla oturum açma butonları eklenmiştir:

| Rol | E-Posta | Şifre | Departman |
|---|---|---|---|
| **Yönetici (Admin)** | `admin@kurum.gov.tr` | `Admin123!` | Bilgi İşlem ve Dijital Dönüşüm |
| **Standart Personel** | `ahmet.yilmaz@kurum.gov.tr` | `Personel123!` | Yazılım ve Yapay Zeka |
| **Standart Personel** | `ayse.demir@kurum.gov.tr` | `Personel123!` | Veri Analitiği ve İş Zekası |
| **Standart Personel** | `mehmet.kaya@kurum.gov.tr` | `Personel123!` | Sistem ve Ağ Güvenliği |

---

## 🚀 Kurulum ve Çalıştırma

### Yöntem 1: Docker Compose ile Tek Tuşla Çalıştırma (Önerilen)

Docker kurulu olan sisteminizde projenin kök dizininde şu komutu çalıştırmanız yeterlidir:

```bash
docker compose up --build
```

- **Web Arayüzü:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Sağlık Kontrolü:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Yöntem 2: Lokal Geliştirme Ortamı Kurulumu

Gereksinimler: Node.js (v18+) ve npm.

#### 1. Backend Kurulumu:
```bash
cd backend

# Bağımlılıkları yükleyin
npm install

# Veritabanını oluşturun ve şemayı uygulayın
npx prisma db push

# Demo verileri (Admin, personel, kategoriler, cihazlar, zimmet logları) yükleyin
npm run prisma:seed

# Backend sunucusunu geliştirici modunda başlatın
npm run dev
```
Backend `http://localhost:5000` portunda çalışacaktır.

#### 2. Frontend Kurulumu:
Ayrı bir terminal penceresinde:
```bash
cd frontend

# Bağımlılıkları yükleyin
npm install

# Vite geliştirici sunucusunu başlatın
npm run dev
```
Frontend `http://localhost:5173` portunda çalışacaktır.

---

## ⚙️ Ortam Değişkenleri (.env)

`backend/.env.example` dosyası aşağıdaki değişkenleri içerir:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="kurum-it-secret-super-secure-key-2026"
CORS_ORIGIN="http://localhost:5173"
```

---

## 📡 REST API Uç Noktaları Özeti

### Kimlik Doğrulama & Profil (`/api/auth`)
- `POST /api/auth/login` — E-posta ve şifre ile giriş (JWT token döner)
- `GET /api/auth/me` — Giriş yapmış kullanıcının profil detayları
- `PUT /api/auth/change-password` — Kendi şifresini değiştirme

### Demirbaş Yönetimi (`/api/assets`)
- `GET /api/assets` — Sayfalama, arama ve durum/kategori/departman filtreli cihaz listesi
- `GET /api/assets/:id` — Demirbaş detayları ve QR kod görseli
- `POST /api/assets` — Yeni demirbaş ekleme (Admin)
- `PUT /api/assets/:id` — Demirbaş bilgilerini güncelleme (Admin)
- `DELETE /api/assets/:id` — Demirbaş silme (Zimmette değilse) (Admin)

### Zimmet & Denetim Tarihçesi (`/api/custody`)
- `POST /api/custody/assign` — Personele cihaz teslimi / zimmetleme
- `POST /api/custody/return` — Zimmetten iade alma
- `POST /api/custody/report-fault` — Arıza bildirme ve teknik servise sevk
- `GET /api/custody/logs` — Tüm zimmet hareketleri ve denetim logları
- `GET /api/custody/my-assets` — Personelin kendi üzerine kayıtlı cihazları

### Gösterge Paneli (`/api/dashboard`)
- `GET /api/dashboard/stats` — Toplam sayaçlar, kategori dağılımı, son hareketler

### Saha & QR Yönetimi (`/api/qr`)
- `GET /api/qr/lookup/:query` — QR, seri no veya barkod ile anında cihaz sorgulama
- `POST /api/qr/quick-action` — Sahada hızlı işlem (Teslim Et, Geri Al, Arıza Bildir)

### Kullanıcı Yönetimi (`/api/users`)
- `GET /api/users` — Kullanıcı listesi
- `POST /api/users` — Yeni kullanıcı oluşturma (Admin)
- `PUT /api/users/:id` — Kullanıcı güncelleme (Admin)
- `PUT /api/users/:id/reset-password` — Kullanıcı şifresi sıfırlama (Admin)
- `DELETE /api/users/:id` — Kullanıcı silme (Admin)

---

## 📄 Lisans ve Teslimat
Bu proje, **T.C. Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü Aday Mühendis Değerlendirme Projesi** için hazırlanmıştır.
Tüm hakları saklıdır.
