import React, { useState, useEffect, useRef } from 'react';
import { assetApi } from '../services/api';
import { Asset } from '../types';
import { QrModal } from '../components/QrModal';
import { AssignModal } from '../components/AssignModal';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Warehouse,
  ShieldCheck,
  Calendar,
  Building,
  User,
  ArrowRight,
  ExternalLink,
  Laptop,
  RefreshCw,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FieldScannerPageProps {
  onSelectAssetDetail: (assetId: string) => void;
  isAdmin: boolean;
}

export const FieldScannerPage: React.FC<FieldScannerPageProps> = ({
  onSelectAssetDetail,
  isAdmin,
}) => {
  const [scannedTag, setScannedTag] = useState('');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Modallar
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Sayfadan ayrılınca kamerayı durdur
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Arka kamera öncelikli
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
          stopCamera();
        },
        (_errorMessage) => {
          // Tarama devam ederken her frame'de çağrılır, hata basmaya gerek yok
        }
      );
    } catch (err: any) {
      console.error('Kamera başlatılamadı:', err);
      setCameraError('Kamera erişimi sağlanamadı. Lütfen kamera izni verdiğinizden emin olun veya aşağıdaki hızlı etiket sorgulamasını kullanın.');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error(e);
      }
    }
    setIsScanning(false);
  };

  const handleSuccessfulScan = async (tag: string) => {
    toast.success(`QR Kod Algılandı: ${tag}`);
    setScannedTag(tag);
    await lookupAsset(tag);
  };

  const lookupAsset = async (tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag) {
      toast.error('Lütfen geçerli bir barkod veya etiket kodu girin.');
      return;
    }

    setLoading(true);
    setAsset(null);
    try {
      const res = await assetApi.getByTag(cleanTag);
      if (res.success && res.data) {
        setAsset(res.data);
        toast.success(`Cihaz bulundu: ${res.data.name}`);
      } else {
        toast.error(`"${cleanTag}" barkodlu cihaz sistemde bulunamadı.`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `"${cleanTag}" barkodlu cihaz bulunamadı.`);
    } finally {
      setLoading(false);
    }
  };

  // Garanti hesaplayıcı (Alım tarihinden itibaren 2 yıl)
  const getWarrantyInfo = (purchaseDateStr: string) => {
    const purchase = new Date(purchaseDateStr);
    const warrantyEnd = new Date(purchase);
    warrantyEnd.setFullYear(purchase.getFullYear() + 2); // 2 Yıl Garanti

    const now = new Date();
    const diffMonths = Math.round((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (now > warrantyEnd) {
      return {
        status: 'EXPIRED',
        badge: 'Garantisi Sona Erdi',
        color: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
        dateText: warrantyEnd.toLocaleDateString('tr-TR'),
      };
    } else {
      return {
        status: 'ACTIVE',
        badge: `Devam Ediyor (Kalan: ${diffMonths} Ay)`,
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
        dateText: warrantyEnd.toLocaleDateString('tr-TR'),
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">QR Okuma ve Cihaz Tanıma (Saha Modu)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cihaz üzerindeki QR kodu kameraya okutarak garanti, alım tarihi ve zimmetli personel bilgilerini anında sorgulayın
            </p>
          </div>
        </div>
      </div>

      {/* İki Kolonlu Panel: Sol -> Kamera / Barkod Girişi, Sağ -> Tanınan Cihaz Bilgisi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Tarayıcı ve Giriş Alanı */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>KAMERA İLE CANLI TARAMA</span>
            </h3>

            {/* Kamera Görüntüleyici Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[260px] flex items-center justify-center">
              <div id="qr-reader-viewport" className="w-full h-full" />

              {!isScanning && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Kamera Şu An Kapalı</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                      Cihazınızın kamerasını kullanarak demirbaş üzerindeki QR kodu taramak için başlatın
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Kamerayı Başlat</span>
                  </button>
                </div>
              )}
            </div>

            {isScanning && (
              <div className="flex justify-center">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 font-bold text-xs border border-red-800/40 transition-colors"
                >
                  Kamerayı Durdur
                </button>
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs">
                {cameraError}
              </div>
            )}

            {/* Manuel Barkod / Etiket Arama */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                VEYA DEMİRBAŞ KODU İLE SORGULA
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  lookupAsset(scannedTag);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Örn: TOGU-2026-001"
                  value={scannedTag}
                  onChange={(e) => setScannedTag(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>

              {/* Hızlı Test Örnekleri (Masaüstü Kullanıcıları İçin Kolaylık) */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Hızlı Test Kodları (Tek Tıkla Tara):</p>
                <div className="flex flex-wrap gap-1.5">
                  {['TOGU-2026-001', 'TOGU-2026-002', 'TOGU-2026-003', 'TOGU-2026-005', 'TOGU-2026-007'].map((demoTag) => (
                    <button
                      key={demoTag}
                      type="button"
                      onClick={() => {
                        setScannedTag(demoTag);
                        lookupAsset(demoTag);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-blue-300 border border-slate-700 transition-colors"
                    >
                      {demoTag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Tanınan Cihaz Künyesi ve Detayları */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="h-full min-h-[380px] bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-semibold">Cihaz kimliği veritabanından çekiliyor...</p>
            </div>
          ) : !asset ? (
            <div className="h-full min-h-[380px] bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center">
                <Laptop className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Henüz Cihaz Taranmadı</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Kameranızı bir TOGU demirbaş QR etiketine tutun veya sol taraftaki hızlı etiket kodlarından birine tıklayın.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 animate-fadeIn">
              {/* Cihaz Başlığı */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/40">
                      {asset.assetTag}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        asset.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : asset.status === 'IN_STOCK'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {asset.status === 'ACTIVE' ? 'ZİMMETTE' : asset.status === 'IN_STOCK' ? 'DEPODA' : 'ARIZALI'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1.5">{asset.name}</h3>
                  <p className="text-xs text-slate-400">{asset.brand} — {asset.model}</p>
                </div>

                {asset.qrCode && (
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="p-2 bg-white rounded-xl shadow-lg hover:scale-105 transition-transform"
                    title="QR Kodu Büyüt"
                  >
                    <img src={asset.qrCode} alt={asset.assetTag} className="w-16 h-16 object-contain" />
                  </button>
                )}
              </div>

              {/* Teknik Özellikler ve İstenen Bilgiler */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Kimde Olduğu (Zimmetli Personel) */}
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>KİMDE OLDUĞU (ZİMMET DURUMU)</span>
                  </div>
                  {asset.assignedToUser ? (
                    <div>
                      <p className="font-bold text-white text-sm">{asset.assignedToUser.fullName}</p>
                      <p className="text-[11px] text-slate-400">{asset.assignedToUser.department}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{asset.assignedToUser.email}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-cyan-400 text-sm">Merkez Depo (Boşta)</p>
                      <p className="text-[11px] text-slate-400">Herhangi bir personele zimmetli değildir.</p>
                    </div>
                  )}
                </div>

                {/* 2. Garanti Durumu */}
                {(() => {
                  const warranty = getWarrantyInfo(asset.purchaseDate);
                  return (
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>GARANTİ BİLGİSİ (2 YIL)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${warranty.color}`}>
                          {warranty.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Bitiş Tarihi: <strong className="text-slate-300">{warranty.dateText}</strong>
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Alım Tarihi */}
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>SATIN ALIM TARİHİ</span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {new Date(asset.purchaseDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[10px] text-slate-500">Resmi fatura ve envanter giriş tarihi</p>
                </div>

                {/* 4. Seri Numarası */}
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-purple-400" />
                    <span>SERİ NUMARASI (S/N)</span>
                  </div>
                  <p className="font-mono font-bold text-blue-400 text-sm">{asset.serialNumber}</p>
                  <p className="text-[10px] text-slate-500">Üretici donanım seri no</p>
                </div>
              </div>

              {/* Hızlı Eylem Butonları */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onSelectAssetDetail(asset.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Geçmiş Zaman Çizelgesini İncele</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white border border-slate-700 transition-colors"
                    title="QR Kodu Büyüt & Yazdır"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  {isAdmin && asset.status !== 'SCRAPPED' && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                        asset.status === 'ACTIVE'
                          ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      }`}
                    >
                      {asset.status === 'ACTIVE' ? 'Depoya İade Al' : 'Personele Zimmetle'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Modalı */}
      {showQrModal && asset && (
        <QrModal
          asset={asset}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Zimmetle / İade Al Modalı */}
      {showAssignModal && asset && (
        <AssignModal
          asset={asset}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => lookupAsset(asset.assetTag)}
        />
      )}
    </div>
  );
};
