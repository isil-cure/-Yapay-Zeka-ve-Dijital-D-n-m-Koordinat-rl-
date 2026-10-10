import React, { useState, useEffect } from 'react';
import { assetApi } from '../services/api';
import { Asset, AssignmentAction, AssetStatus } from '../types';
import { QrModal } from '../components/QrModal';
import { AssignModal } from '../components/AssignModal';
import {
  ArrowLeft,
  QrCode,
  UserCheck,
  ArrowDownLeft,
  Clock,
  Warehouse,
  AlertTriangle,
  Tag,
  Calendar,
  Building,
  User,
  Activity,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AssetDetailPageProps {
  assetId: string;
  onBack: () => void;
  isAdmin: boolean;
}

export const AssetDetailPage: React.FC<AssetDetailPageProps> = ({
  assetId,
  onBack,
  isAdmin,
}) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadAssetDetail();
  }, [assetId]);

  const loadAssetDetail = async () => {
    try {
      setLoading(true);
      const res = await assetApi.getById(assetId);
      if (res.success) {
        setAsset(res.data);
      }
    } catch (err: any) {
      toast.error('Demirbaş detayı yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Aktif Zimmette
          </span>
        );
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Warehouse className="w-3.5 h-3.5" />
            Depoda / Boşta
          </span>
        );
      case 'IN_REPAIR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Arızalı / Bakımda
          </span>
        );
      case 'SCRAPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            Hurda
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Activity className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm">Demirbaş künyesi ve zaman çizelgesi yükleniyor...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Demirbaş bulunamadı.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs">
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Geri Dön Butonu ve Başlık */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Listeye Geri Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/40">
                {asset.assetTag}
              </span>
              {getStatusBadge(asset.status)}
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-1">{asset.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>QR Etiketi</span>
          </button>

          {isAdmin && asset.status !== 'SCRAPPED' && (
            <button
              onClick={() => setShowAssignModal(true)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                asset.status === 'ACTIVE'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              {asset.status === 'ACTIVE' ? (
                <>
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Depoya İade Al</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Personele Zimmetle</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cihaz Künyesi ve QR Kod Kartı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol 2 Kolon: Teknik Özellikler ve Künye */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            CİHAZ KÜNYESİ VE TEKNİK BİLGİLER
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">MARKA</span>
              <p className="font-bold text-white text-sm">{asset.brand}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">MODEL</span>
              <p className="font-bold text-white text-sm">{asset.model}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">SERİ NUMARASI</span>
              <p className="font-mono font-bold text-blue-400 text-sm">{asset.serialNumber}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">SATIN ALMA TARİHİ</span>
              <p className="font-bold text-white text-sm">
                {new Date(asset.purchaseDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Zimmet Durumu Kartı */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  GÜNCEL ZİMMETLİ KULLANICI
                </p>
                {asset.assignedToUser ? (
                  <div>
                    <p className="text-sm font-bold text-white">{asset.assignedToUser.fullName}</p>
                    <p className="text-xs text-slate-400">
                      {asset.assignedToUser.department} — {asset.assignedToUser.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-400 italic">
                    Cihaz şu an zimmette değildir. Merkez depoda hazır beklemektedir.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: QR Kod Önizlemesi */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            DİJİTAL KİMLİK (QR KOD)
          </p>
          <div className="p-4 bg-white rounded-2xl shadow-xl">
            <img src={asset.qrCode} alt={asset.assetTag} className="w-40 h-40 object-contain" />
          </div>
          <div className="mt-4 font-mono font-bold text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            {asset.assetTag}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 max-w-[200px]">
            Akıllı telefon kamerası veya barkod okuyucu ile taranabilir.
          </p>
          <button
            onClick={() => setShowQrModal(true)}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold transition-colors"
          >
            Büyük Göster & Yazdır
          </button>
        </div>
      </div>

      {/* Zaman Çizelgesi (Custody Timeline) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Zimmet Geçmişi ve Denetim İzi (Timeline)</h3>
            <p className="text-[11px] text-slate-400">
              Bu cihaz üzerinde gerçekleştirilen tüm atama, iade ve durum değişiklikleri
            </p>
          </div>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {(!asset.assignmentLogs || asset.assignmentLogs.length === 0) ? (
            <p className="text-xs text-slate-400 py-4">Bu cihaza ait geçmiş kayıt bulunamadı.</p>
          ) : (
            asset.assignmentLogs.map((log) => {
              const isAssign = log.action === 'ASSIGN';
              const isReturn = log.action === 'RETURN';

              return (
                <div key={log.id} className="relative group">
                  {/* Zaman Çizgisi Noktası */}
                  <div
                    className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 ${
                      isAssign
                        ? 'bg-emerald-500 border-slate-900 ring-4 ring-emerald-500/20'
                        : isReturn
                        ? 'bg-amber-500 border-slate-900 ring-4 ring-amber-500/20'
                        : 'bg-blue-500 border-slate-900 ring-4 ring-blue-500/20'
                    }`}
                  />

                  {/* Log Kartı */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            isAssign
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isReturn
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {isAssign ? 'ZİMMET ATAMA' : isReturn ? 'ZİMMET İADESİ' : 'DURUM DEĞİŞİMİ'}
                        </span>
                        {log.user && (
                          <span className="font-semibold text-white">
                            Personel: {log.user.fullName} ({log.user.department})
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {new Date(log.createdAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      {log.notes || 'Açıklama belirtilmedi.'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modallar */}
      {showQrModal && (
        <QrModal
          asset={asset}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {showAssignModal && (
        <AssignModal
          asset={asset}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => loadAssetDetail()}
        />
      )}
    </div>
  );
};
