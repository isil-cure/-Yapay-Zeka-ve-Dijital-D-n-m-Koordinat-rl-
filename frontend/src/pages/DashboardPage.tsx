import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { DashboardStats, AssignmentAction } from '../types';
import { StatCards } from '../components/StatCards';
import { Activity, Plus, RefreshCw, Clock, ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardPageProps {
  onNavigateAssets: (statusFilter?: string) => void;
  onOpenAddModal: () => void;
  isAdmin: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateAssets,
  onOpenAddModal,
  isAdmin,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err: any) {
      toast.error('Dashboard verileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: AssignmentAction) => {
    switch (action) {
      case 'ASSIGN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ZİMMETLENDİ
          </span>
        );
      case 'RETURN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            İADE ALINDI
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            DURUM DEĞİŞİMİ
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">İstatistikler ve denetim logları yükleniyor...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Üst Karşılama ve Hızlı Eylem Başlığı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Sistem Genel Bakış</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tokat Gaziosmanpaşa Üniversitesi IT Demirbaş & Zimmet Takip Paneli
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadStats}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={onOpenAddModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Demirbaş Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Ana İstatistik Kartı */}
      <StatCards
        metrics={stats.metrics}
        onFilterClick={(status) => onNavigateAssets(status)}
      />

      {/* İki Kolonlu Panel: Sol -> Son Zimmet Hareketleri, Sağ -> Departman Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Zimmet Hareketleri Tablosu (2 Kolon Genişlik) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Son Zimmet Hareketleri</h3>
                <p className="text-[11px] text-slate-400">Denetim izi ve anlık envanter kayıtları</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateAssets()}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Demirbaş</th>
                  <th className="pb-3">İşlem Türü</th>
                  <th className="pb-3">İlgili Personel</th>
                  <th className="pb-3">Tarih</th>
                  <th className="pb-3 pr-2">Açıklama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Henüz zimmet hareketi kaydedilmedi.
                    </td>
                  </tr>
                ) : (
                  stats.recentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2 font-medium text-white">
                        <div className="font-mono text-blue-400 font-bold text-[11px]">
                          {act.asset?.assetTag || '—'}
                        </div>
                        <div className="text-slate-300 truncate max-w-[150px]">
                          {act.asset?.name || 'Bilinmeyen Demirbaş'}
                        </div>
                      </td>
                      <td className="py-3.5">{getActionBadge(act.action)}</td>
                      <td className="py-3.5">
                        {act.user ? (
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium truncate max-w-[120px]">{act.user.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Merkez Depo</span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(act.createdAt).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 text-slate-400 truncate max-w-[180px]">
                        {act.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sağ Kolon: Aktif Zimmet Departman Dağılımı */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Departman Dağılımı</h3>
              <p className="text-[11px] text-slate-400">Aktif zimmetli cihazların birimleri</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {Object.keys(stats.departmentDistribution).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Henüz personele zimmetlenmiş aktif cihaz yok.
              </p>
            ) : (
              Object.entries(stats.departmentDistribution).map(([dept, count]) => {
                const total = stats.metrics.activeAssigned || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[160px]">{dept}</span>
                      <span className="text-blue-400 font-bold font-mono">
                        {count} Cihaz ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-950/40 -mx-6 -mb-6 p-4 rounded-b-3xl text-center">
            <p className="text-[11px] text-slate-400">
              Tokat Gaziosmanpaşa Üniversitesi IT Varlık Güvenliği
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
