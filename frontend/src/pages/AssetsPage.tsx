import React, { useState, useEffect } from 'react';
import { assetApi } from '../services/api';
import { Asset, AssetStatus, Pagination } from '../types';
import { QrModal } from '../components/QrModal';
import { AssignModal } from '../components/AssignModal';
import {
  Search,
  Plus,
  QrCode,
  UserCheck,
  ArrowDownLeft,
  Eye,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Warehouse,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AssetsPageProps {
  initialStatusFilter?: string;
  onOpenAddModal: () => void;
  onSelectAssetDetail: (assetId: string) => void;
  isAdmin: boolean;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({
  initialStatusFilter = '',
  onOpenAddModal,
  onSelectAssetDetail,
  isAdmin,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Modal Durumları
  const [selectedQrAsset, setSelectedQrAsset] = useState<Asset | null>(null);
  const [selectedAssignAsset, setSelectedAssignAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAssets();
  }, [page, statusFilter]);

  const loadAssets = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const q = searchQuery !== undefined ? searchQuery : search;
      const res = await assetApi.getAll({
        page,
        limit: 10,
        search: q.trim() || undefined,
        status: statusFilter ? (statusFilter as AssetStatus) : undefined,
      });

      if (res.success) {
        setAssets(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      toast.error('Demirbaş listesi yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAssets(search);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!window.confirm(`"${asset.assetTag} - ${asset.name}" demirbaşını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await assetApi.delete(asset.id);
      toast.success(`${asset.assetTag} başarıyla silindi.`);
      loadAssets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Demirbaş silinemedi.');
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif Zimmetli
          </span>
        );
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Warehouse className="w-3 h-3" />
            Depoda / Boşta
          </span>
        );
      case 'IN_REPAIR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Arızalı / Bakımda
          </span>
        );
      case 'SCRAPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            Hurda
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Aksiyon Barı */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Demirbaş Envanteri</h2>
          <p className="text-xs text-slate-400 mt-1">
            Toplam {pagination.total} kayıtlı demirbaş varlığı listeleniyor
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => loadAssets()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Listeyi Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={onOpenAddModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Demirbaş Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Arama ve Filtreleme Şeridi */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Durum Filtre Tabları */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: '', label: 'Tümü' },
            { id: 'ACTIVE', label: 'Zimmetli' },
            { id: 'IN_STOCK', label: 'Depoda' },
            { id: 'IN_REPAIR', label: 'Arızalı' },
            { id: 'SCRAPPED', label: 'Hurda' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Anlık Arama Formu */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Etiket, seri no, marka, model veya personel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>
      </div>

      {/* Demirbaş Tablosu */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-4 pl-6">Barkod / Etiket</th>
                <th className="py-4">Demirbaş Adı</th>
                <th className="py-4">Marka & Model</th>
                <th className="py-4">Seri Numarası (S/N)</th>
                <th className="py-4">Durum</th>
                <th className="py-4">Zimmetli Personel</th>
                <th className="py-4 pr-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Demirbaş kayıtları taranıyor...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Arama kriterlerine uygun demirbaş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors group">
                    {/* Etiket Kodu */}
                    <td className="py-4 pl-6">
                      <div className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/40 text-blue-300 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                        <Tag className="w-3 h-3 text-blue-400" />
                        <span>{asset.assetTag}</span>
                      </div>
                    </td>

                    {/* Demirbaş Adı */}
                    <td className="py-4 font-semibold text-white max-w-[200px]">
                      <button
                        onClick={() => onSelectAssetDetail(asset.id)}
                        className="hover:text-blue-400 text-left transition-colors truncate block w-full"
                        title={asset.name}
                      >
                        {asset.name}
                      </button>
                    </td>

                    {/* Marka & Model */}
                    <td className="py-4 text-slate-300">
                      <div>{asset.brand}</div>
                      <div className="text-[11px] text-slate-400">{asset.model}</div>
                    </td>

                    {/* Seri No */}
                    <td className="py-4 font-mono text-slate-400 text-[11px]">
                      {asset.serialNumber}
                    </td>

                    {/* Durum Rozeti */}
                    <td className="py-4">{getStatusBadge(asset.status)}</td>

                    {/* Zimmetli Personel */}
                    <td className="py-4">
                      {asset.assignedToUser ? (
                        <div>
                          <div className="font-semibold text-slate-200">
                            {asset.assignedToUser.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {asset.assignedToUser.department}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Merkez Depo</span>
                      )}
                    </td>

                    {/* Eylem Butonları */}
                    <td className="py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* QR Modal Butonu */}
                        <button
                          onClick={() => setSelectedQrAsset(asset)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-blue-400 hover:text-white border border-slate-700/60 hover:border-blue-500/40 transition-colors"
                          title="QR Kodunu Görüntüle & Yazdır"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Zimmetle / İade Al (Admin) */}
                        {isAdmin && asset.status !== 'SCRAPPED' && (
                          <button
                            onClick={() => setSelectedAssignAsset(asset)}
                            className={`p-1.5 rounded-lg text-white border transition-colors ${
                              asset.status === 'ACTIVE'
                                ? 'bg-amber-900/30 hover:bg-amber-800/60 text-amber-300 border-amber-800/40'
                                : 'bg-emerald-900/30 hover:bg-emerald-800/60 text-emerald-300 border-emerald-800/40'
                            }`}
                            title={asset.status === 'ACTIVE' ? 'Depoya İade Al' : 'Personele Zimmetle'}
                          >
                            {asset.status === 'ACTIVE' ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Detay & Timeline Butonu */}
                        <button
                          onClick={() => onSelectAssetDetail(asset.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                          title="Cihaz Künyesi & Zimmet Zaman Çizelgesi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Sil (Admin) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-800/40 transition-colors"
                            title="Demirbaşı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama (Pagination Bar) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/30 text-xs text-slate-400">
          <div>
            Sayfa <span className="font-bold text-white">{pagination.page}</span> / {pagination.totalPages || 1} (Toplam {pagination.total} Cihaz)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300 px-2 font-bold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Modalı */}
      {selectedQrAsset && (
        <QrModal
          asset={selectedQrAsset}
          onClose={() => setSelectedQrAsset(null)}
        />
      )}

      {/* Zimmetleme / İade Modalı */}
      {selectedAssignAsset && (
        <AssignModal
          asset={selectedAssignAsset}
          onClose={() => setSelectedAssignAsset(null)}
          onSuccess={() => loadAssets()}
        />
      )}
    </div>
  );
};
