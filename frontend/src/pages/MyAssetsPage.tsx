import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { User, Asset } from '../types';
import { QrModal } from '../components/QrModal';
import {
  UserCheck,
  Laptop,
  QrCode,
  FileText,
  Printer,
  Calendar,
  Building,
  Mail,
  Shield,
  Eye,
  RefreshCw,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MyAssetsPageProps {
  onSelectAssetDetail: (assetId: string) => void;
}

export const MyAssetsPage: React.FC<MyAssetsPageProps> = ({ onSelectAssetDetail }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQrAsset, setSelectedQrAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success) {
        setProfile(res.user);
      }
    } catch (err: any) {
      toast.error('Profil ve zimmet bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintProtocol = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm">Kişisel zimmet bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!profile) return null;

  const myAssets = profile.assignedAssets || [];

  return (
    <div>
      {/* ====================================================================
          1. EKRAN GÖRÜNÜMÜ (Normal Web Arayüzü - Baskıda gizlenir)
          ==================================================================== */}
      <div className="no-print space-y-6">
        {/* Üst Başlık & Yazdır Butonu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Kişisel Zimmet Ekranı</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Üzerinize kayıtlı ve kullanımınıza tahsis edilen resmi kurum donanımları
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadProfile}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {myAssets.length > 0 && (
              <button
                onClick={handlePrintProtocol}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Resmi Zimmet Tutanağı Yazdır</span>
              </button>
            )}
          </div>
        </div>

        {/* Personel Künye Kartı */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{profile.fullName}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    profile.role === 'ADMIN'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {profile.role === 'ADMIN' ? 'YÖNETİCİ' : 'PERSONEL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile.department}</span>
              </p>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile.email}</span>
              </p>
            </div>
          </div>

          {/* Zimmet Durum Özeti Sayacı */}
          <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ZİMMETLİ CİHAZ SAYISI
              </p>
              <p className="text-2xl font-black text-white font-mono">{myAssets.length} Adet</p>
            </div>
          </div>
        </div>

        {/* Zimmetli Donanımlar Listesi */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            ÜZERİNİZE ZİMMETLİ DONANIMLAR LİSTESİ ({myAssets.length})
          </h3>

          {myAssets.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">Adınıza Kayıtlı Demirbaş Bulunmuyor</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Şu anda üzerinize zimmetlenmiş aktif bir donanım bulunmamaktadır. İhtiyaç halinde Bilgi İşlem / IT biriminden donanım talep edebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/40 text-blue-300 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs mb-2">
                        <Tag className="w-3 h-3 text-blue-400" />
                        <span>{asset.assetTag}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {asset.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {asset.brand} — {asset.model}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        S/N: {asset.serialNumber}
                      </p>
                    </div>

                    {asset.qrCode && (
                      <button
                        onClick={() => setSelectedQrAsset(asset)}
                        className="p-2 bg-white rounded-xl shadow-md hover:scale-105 transition-transform"
                        title="QR Kodu Büyüt"
                      >
                        <img src={asset.qrCode} alt={asset.assetTag} className="w-14 h-14 object-contain" />
                      </button>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif Kullanımda
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQrAsset(asset)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors"
                        title="QR Kod Görüntüle & Yazdır"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectAssetDetail(asset.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detay</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          2. YAZDIRMA ŞABLONU (Yalnızca window.print / Yazdır Komutunda Çıkar)
          ==================================================================== */}
      <div className="printable-protocol">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15pt', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
            T.C. TOKAT GAZİOSMANPAŞA ÜNİVERSİTESİ
          </h2>
          <h3 style={{ fontSize: '11pt', fontWeight: '600', margin: '0 0 10px 0', color: '#333', textTransform: 'uppercase' }}>
            Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
          </h3>
          <div style={{ display: 'inline-block', border: '1px solid #000', padding: '4px 16px', fontWeight: 'bold', fontSize: '11pt', letterSpacing: '0.05em' }}>
            BİLİŞİM DONANIMLARI ZİMMET VE TESLİM-TESELLÜM TUTANAĞI
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', marginBottom: '16px', lineHeight: '1.6' }}>
          <div>
            <p><strong>Zimmet Sahibi Personel:</strong> {profile.fullName}</p>
            <p><strong>Görev / Departman:</strong> {profile.department}</p>
            <p><strong>Kurumsal E-posta:</strong> {profile.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Tutanak No:</strong> ZMT-{new Date().getFullYear()}-{profile.id.slice(0, 6).toUpperCase()}</p>
            <p><strong>Düzenlenme Tarihi:</strong> {new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            <p><strong>Sistem Durumu:</strong> AKTİF ZİMMETLİ</p>
          </div>
        </div>

        <p style={{ fontSize: '9.5pt', marginBottom: '12px', textAlign: 'justify', lineHeight: '1.4' }}>
          Aşağıda marka, model, seri numarası ve demirbaş etiket bilgileri açıkça belirtilen üniversitemiz bilişim varlıkları; kurum içi akademik/idari görev ve AR-GE faaliyetlerinde kullanılmak üzere eksiksiz, sağlam ve çalışır vaziyette ilgili personele zimmetlenerek teslim edilmiştir.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '35px', textAlign: 'center' }}>Sıra</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '110px' }}>Etiket No</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Cihaz Adı & Tanımı</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '80px' }}>Marka</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Model</th>
              <th style={{ border: '1px solid #000', padding: '6px 8px', width: '120px' }}>Seri No (S/N)</th>
            </tr>
          </thead>
          <tbody>
            {myAssets.map((asset, index) => (
              <tr key={asset.id}>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontFamily: 'monospace', fontWeight: 'bold' }}>{asset.assetTag}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{asset.name}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{asset.brand}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{asset.model}</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontFamily: 'monospace' }}>{asset.serialNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontSize: '8.5pt', color: '#444', marginBottom: '30px', fontStyle: 'italic', lineHeight: '1.4' }}>
          * İşbu tutanak iki nüsha olarak tanzim edilmiş olup, cihazların bakım, koruma ve güvenlik sorumluluğu teslim alan personele aittir. Görev değişikliği veya kurumdan ayrılma durumunda cihazlar IT/Ayniyat birimine eksiksiz iade edilmelidir.
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', fontSize: '10pt', marginTop: '20px' }}>
          <div style={{ width: '220px' }}>
            <p style={{ fontWeight: 'bold' }}>TESLİM EDEN</p>
            <p style={{ fontSize: '9pt', color: '#555', marginTop: '2px' }}>Bilgi İşlem / IT Yönetimi</p>
            <div style={{ height: '50px' }}></div>
            <div style={{ borderTop: '1px dashed #000', paddingTop: '4px' }}>İmza / Kaşe</div>
          </div>
          <div style={{ width: '220px' }}>
            <p style={{ fontWeight: 'bold' }}>TESLİM ALAN</p>
            <p style={{ fontSize: '9pt', color: '#555', marginTop: '2px' }}>{profile.fullName}</p>
            <div style={{ height: '50px' }}></div>
            <div style={{ borderTop: '1px dashed #000', paddingTop: '4px' }}>İmza</div>
          </div>
        </div>
      </div>

      {/* QR Kod Modalı */}
      {selectedQrAsset && (
        <QrModal
          asset={selectedQrAsset}
          onClose={() => setSelectedQrAsset(null)}
        />
      )}
    </div>
  );
};
