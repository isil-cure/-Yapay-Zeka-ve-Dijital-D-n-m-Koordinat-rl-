# 🎓 Tokat Gaziosmanpaşa Üniversitesi
## Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
### Aday Mühendis Değerlendirme Projesi: IT Demirbaş ve Zimmet Yönetim Sistemi

---

### 👩‍💻 Geliştirici & Proje Künyesi
- **Geliştirici:** Işıl Cüre
- **GitHub:** [https://github.com/isil-cure](https://github.com/isil-cure)
- **Kurum:** Tokat Gaziosmanpaşa Üniversitesi (TOGU)
- **Birim:** Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
- **Proje Adı:** IT Demirbaş ve Zimmet Yönetim Sistemi (IT Asset & Custody Tracking System)
- **Sürüm:** `2.0.0 (Production Architecture)`

---

## 📌 Proje Özeti ve Amaç
Bu proje; Tokat Gaziosmanpaşa Üniversitesi bünyesinde yer alan tüm bilişim ve donanım varlıklarının (sunucular, ağ anahtarları, iş istasyonları, dizüstü bilgisayarlar, monitörler) merkezi bir envanterde kayıt altına alınması, cihazlara otomatik **QR Kod (Base64 DataURL)** üretilmesi, personele **zimmetleme / depoya iade** süreçlerinin yönetilmesi ve tüm bu hareketlerin denetim iziyle (**AssignmentHistory Timeline**) takip edilmesini sağlayan uçtan uca, kurumsal seviyede bir Full-Stack sistemdir.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji / Kütüphane | Açıklama |
| :--- | :--- | :--- |
| **Backend** | **Node.js, Express.js, TypeScript** | Tip güvenli, katmanlı RESTful API mimarisi |
| **Veritabanı & ORM** | **PostgreSQL 15, Prisma ORM** | İlişkisel veri modeli, otomatik migration ve seed |
| **Güvenlik & Auth** | **JWT (JSON Web Token), bcryptjs** | Rol Bazlı Yetkilendirme (RBAC: `ADMIN`, `STAFF`) |
| **Barkod & QR** | **qrcode (Base64 DataURL / SVG)** | Otomatik etiket üretimi ve anlık QR çözümleme |
| **Frontend** | **React 18, Vite, TypeScript** | Hızlı, tip güvenli modern reaktif arayüz |
| **Stil & Tasarım** | **Tailwind CSS** | TOGU kurumsal koyu lacivert/gri yönetici teması |
| **İkonografi & UX** | **Lucide Icons, react-hot-toast** | Profesyonel görsel bileşenler ve anlık geri bildirimler |
| **İstemci** | **Axios (Interceptors)** | Otomatik JWT taşıyıcı ve hata yakalama katmanı |
| **DevOps** | **Docker, Docker Compose, Nginx** | Tek tıkla veritabanı, backend ve frontend kurulumu |

---

## 🚀 Hızlı Başlangıç & Kurulum

### Yöntem 1: Docker Compose ile Tek Tıkla Kurulum (Önerilen)
Sistemde Docker ve Docker Compose kurulu ise, tüm servisleri (PostgreSQL, Backend ve Frontend) tek bir komutla ayağa kaldırabilirsiniz:

```bash
# Projeyi derleyin ve tüm konteynerleri başlatın
docker-compose up --build
```

Konteynerler ayağa kalktığında:
1. `postgres` (Port 5432) sağlık kontrolü (healthcheck) tamamlanır.
2. `backend` (Port 5000) otomatik olarak `npx prisma db push` ve `npx prisma db seed` komutlarını çalıştırarak tabloları ve test verilerini yükler.
3. `frontend` (Port 3000) Nginx üzerinden derlenmiş olarak yayına başlar.

- **Frontend Arayüzü:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Sağlık Testi:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Yöntem 2: Manuel Geliştirme Ortamı (Local Dev)

#### 1. Backend Kurulumu:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
# Backend http://localhost:5000 adresinde dinlemeye başlar
```

#### 2. Frontend Kurulumu:
```bash
cd frontend
npm install
npm run dev
# Frontend http://localhost:5173 adresinde açılır
```

---

## 🔑 Varsayılan Test Giriş Bilgileri

Jüri ve değerlendirme heyetinin hızlıca test yapabilmesi için giriş sayfasında **tek tıkla doldurma butonları** bulunmaktadır:

| Rol | E-Posta | Şifre | Yetkiler |
| :--- | :--- | :--- | :--- |
| **Yönetici (Admin)** | `admin@gop.edu.tr` | `admin123` | Tüm demirbaş CRUD, QR basma, personele zimmetleme, iade alma, kullanıcı yönetimi |
| **Personel (Staff)** | `personel@gop.edu.tr` | `personel123` | Envanter listeleme, QR görüntüleme, cihaz detayları ve zimmet geçmişini inceleme |
| **Personel (Staff - 2)** | `mehmet.kaya@gop.edu.tr` | `personel123` | Envanter listeleme ve zimmet geçmişi inceleme |

---

## 📡 RESTful API Uç Noktaları Tablosu

| Metot | Uç Nokta | Açıklama | Yetki Gereksinimi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | E-posta ve şifre ile giriş yapar, JWT token döner | Herkese Açık |
| `POST` | `/api/auth/register` | Yeni personel kaydeder | Yalnızca `ADMIN` |
| `GET` | `/api/auth/me` | Oturum açan kullanıcının profil ve zimmet bilgilerini döner | `ADMIN` / `STAFF` |
| `GET` | `/api/assets` | Demirbaşları listeler (`page`, `limit`, `search`, `status`, `department`) | `ADMIN` / `STAFF` |
| `POST` | `/api/assets` | Yeni demirbaş ekler, **otomatik Base64 QR kodu üretir** | Yalnızca `ADMIN` |
| `GET` | `/api/assets/:id` | Cihaz detayı, zimmetli personel ve geçmiş denetim izini döner | `ADMIN` / `STAFF` |
| `GET` | `/api/assets/qr/:assetTag` | QR barkod etiketi (`assetTag`) ile cihaz sorgular | `ADMIN` / `STAFF` |
| `PUT` | `/api/assets/:id` | Demirbaş bilgilerini günceller (durum değişirse log atar) | Yalnızca `ADMIN` |
| `DELETE` | `/api/assets/:id` | Demirbaş kaydını siler (aktif zimmette ise engellenir) | Yalnızca `ADMIN` |
| `POST` | `/api/assets/:id/assign` | Cihazı personele zimmetler (Durum: `ACTIVE`, log kaydı atılır) | Yalnızca `ADMIN` |
| `POST` | `/api/assets/:id/return` | Cihazı personelden iade alır (Durum: `IN_STOCK`, log kaydı atılır) | Yalnızca `ADMIN` |
| `GET` | `/api/assets/:id/history` | Demirbaşın tüm zimmet/iade/durum geçmişi zaman çizelgesini döner | `ADMIN` / `STAFF` |
| `GET` | `/api/dashboard/stats` | Toplam, zimmetli, depoda, arızalı sayıları, son 5 hareket ve departman dağılımı | `ADMIN` / `STAFF` |
| `GET` | `/api/users` | Personel listesini üzerlerindeki zimmetli cihaz sayılarıyla döner | `ADMIN` / `STAFF` |
| `PUT` | `/api/users/:id` | Personel bilgilerini ve rolünü günceller | Yalnızca `ADMIN` |
| `DELETE` | `/api/users/:id` | Personeli siler (üzerinde aktif zimmet varsa engellenir) | Yalnızca `ADMIN` |
| `GET` | `/api/health` | PostgreSQL ve API servis canlılık sağlık testi | Herkese Açık |

---

## 🗄️ Veritabanı Modelleri ve İlişki Şeması (Prisma)

```mermaid
erDiagram
    USER ||--o{ ASSET : "zimmetli_cihazlar"
    USER ||--o{ ASSIGNMENT_HISTORY : "gecmis_hareketler"
    ASSET ||--o{ ASSIGNMENT_HISTORY : "denetim_izleri"

    USER {
        string id PK "UUID"
        string email UK
        string passwordHash
        string fullName
        string department
        Role role "ADMIN | STAFF"
        datetime createdAt
    }

    ASSET {
        string id PK "UUID"
        string assetTag UK "TOGU-2026-001"
        string name
        string brand
        string model
        string serialNumber UK
        datetime purchaseDate
        AssetStatus status "ACTIVE | IN_STOCK | IN_REPAIR | SCRAPPED"
        string qrCode "Base64 DataURL"
        string assignedToUserId FK
        datetime createdAt
        datetime updatedAt
    }

    ASSIGNMENT_HISTORY {
        string id PK "UUID"
        string assetId FK
        string userId FK
        AssignmentAction action "ASSIGN | RETURN | STATUS_CHANGE"
        string notes
        datetime createdAt
    }
```

---

## 🖼️ Ekran Görüntüleri ve Arayüz Önizlemeleri

### 1. Yönetici Gösterge Paneli (Dashboard)
Üstte 4 istatistik kartı, departman dağılım çubukları ve anlık denetim hareketleri:
![Dashboard](docs/dashboard.png)

### 2. Demirbaş Envanteri ve Durum Filtreleri
Anlık arama, durum rozetleri, sayfalama ve hızlı zimmetleme butonları:
![Demirbaş Listesi](docs/assets.png)

### 3. QR Kod Etiket Modalı ve Yazdırma Önizlemesi
Kurumsal TOGU logolu, yazdırmaya ve PNG indirmeye hazır QR kartı:
![QR Modal](docs/qr-modal.png)

---

## 🌟 Öne Çıkan Mühendislik Prensipleri
1. **Clean Architecture & Katmanlı Yapı:** Kontrolcüler (`controllers`), iş servisleri (`services`), doğrulama ara yazılımları (`middlewares`) ve rotalar (`routes`) birbirinden net biçimde ayrıştırılmıştır.
2. **Otomatik QR Üretimi:** Her yeni donanım kaydında `qrcode` kütüphanesiyle yüksek çözünürlüklü ve hataya dayanıklı (`Level H`) Base64 Data URL doğrudan oluşturulup `Asset.qrCode` alanına işlenir.
3. **Denetim İzi (Audit Trail):** Hiçbir zimmet atama, iade veya donanım durum değişikliği loglanmadan geçmez; `AssignmentHistory` tablosu üzerinde zaman çizelgesi olarak kronolojik olarak tutulur.
4. **Tip Güvenliği (Full Type-Safety):** Backend TypeScript modelleri ve Prisma Client ile %100 tip güvenliği, Frontend ise katı TypeScript arabirimleriyle korunmaktadır.
5. **Modern Kurumsal UI/UX:** Tailwind CSS ile Tokat Gaziosmanpaşa Üniversitesi kurumsal renklerine uygun koyu lacivert ve gri tonlar, mobil uyumlu hamburger menü ve `react-hot-toast` etkileşimleri.

---

> **Telif & Lisans:** Bu proje, Tokat Gaziosmanpaşa Üniversitesi Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü "Aday Mühendis Değerlendirmesi" amacıyla **Işıl Cüre** tarafından sıfırdan geliştirilmiştir.
