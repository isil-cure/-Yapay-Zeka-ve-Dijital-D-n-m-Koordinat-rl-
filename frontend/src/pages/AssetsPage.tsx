import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { QrCardModal } from '../components/QrCardModal';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Calendar,
  Building,
  Tag,
  Hash
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtreler & Sayfalama
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modallar
  const [selectedAssetForQr, setSelectedAssetForQr] = useState<any | null>(null);
  const [detailModalAsset, setDetailModalAsset] = useState<any | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  // Zimmetleme Hızlı Modalı
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningAsset, setAssigningAsset] = useState<any | null>(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    categoryId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyEndDate: '',
    location: 'Merkez IT Depo',
    cost: '',
    notes: '',
    status: 'AVAILABLE',
  });

  const fetchCategoriesAndUsers = async () => {
    try {
      const [cats, userList] = await Promise.all([api.getCategories(), api.getUsers()]);
      setCategories(cats);
      setUsers(userList);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAssets({
        page,
        limit: 10,
        search,
        status: statusFilter,
        categoryId: categoryFilter,
        department: departmentFilter,
      });
      setAssets(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.total);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter, departmentFilter]);

  useEffect(() => {
    fetchCategoriesAndUsers();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleOpenAdd = () => {
    setEditingAsset(null);
    setFormData({
      brand: '',
      model: '',
      serialNumber: '',
      categoryId: categories[0]?.id || '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyEndDate: '',
      location: 'Merkez IT Depo',
      cost: '',
      notes: '',
      status: 'AVAILABLE',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (asset: any) => {
    setEditingAsset(asset);
    setFormData({
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      categoryId: asset.categoryId,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toISOString().split('T')[0] : '',
      location: asset.location || '',
      cost: asset.cost ? String(asset.cost) : '',
      notes: asset.notes || '',
      status: asset.status,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.updateAsset(editingAsset.id, formData);
        showToast('Demirbaş bilgileri güncellendi.', 'success');
      } else {
        const res = await api.createAsset(formData);
        showToast(`${res.asset.brand} ${res.asset.model} başarıyla kaydedildi.`, 'success');
      }
      setIsFormModalOpen(false);
      fetchAssets();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" adlı demirbaşı silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteAsset(id);
      showToast('Demirbaş kaydı silindi.', 'success');
      fetchAssets();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenAssign = (asset: any) => {
    setAssigningAsset(asset);
    setAssignUserId(users[0]?.id || '');
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningAsset || !assignUserId) return;
    try {
      await api.assignAsset({
        assetId: assigningAsset.id,
        userId: assignUserId,
        notes: assignNotes,
      });
      showToast('Demirbaş başarıyla personele zimmetlendi.', 'success');
      setIsAssignModalOpen(false);
      fetchAssets();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReturn = async (asset: any) => {
    if (!window.confirm(`${asset.brand} ${asset.model} cihazını ${asset.currentUser?.fullName || 'personel'} üzerinden iade almak istiyor musunuz?`)) return;
    try {
      await api.returnAsset({ assetId: asset.id });
      showToast('Cihaz başarıyla depoya iade alındı.', 'success');
      fetchAssets();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleShowQr = async (asset: any) => {
    try {
      const full = await api.getAsset(asset.id);
      setSelectedAssetForQr(full);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge badge-available">Depoda / Kullanılabilir</span>;
      case 'ASSIGNED':
        return <span className="badge badge-assigned">Zimmetli</span>;
      case 'IN_REPAIR':
        return <span className="badge badge-repair">Arızalı / Bakımda</span>;
      case 'SCRAPPED':
        return <span className="badge badge-scrapped">Hurda / Hizmet Dışı</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Arama Inputu */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Marka, Model, Seri No, Demirbaş Kodu veya Konum ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
              id="input-asset-search"
            />
          </div>

          {/* Durum Filtresi */}
          <div style={{ minWidth: 170 }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              id="select-status-filter"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="AVAILABLE">Depoda (Kullanılabilir)</option>
              <option value="ASSIGNED">Zimmetli</option>
              <option value="IN_REPAIR">Arızalı / Bakımda</option>
              <option value="SCRAPPED">Hurda</option>
            </select>
          </div>

          {/* Kategori Filtresi */}
          <div style={{ minWidth: 170 }}>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              id="select-category-filter"
            >
              <option value="ALL">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Yeni Demirbaş Butonu */}
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleOpenAdd} id="btn-add-asset-page">
              <Plus size={18} />
              <span>Yeni Cihaz Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Demirbaş Tablosu */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Demirbaş Kodu</th>
                <th>Cihaz / Model</th>
                <th>Kategori</th>
                <th>Seri No</th>
                <th>Durum</th>
                <th>Zimmetli Personel</th>
                <th>Konum</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Kriterlere uygun demirbaş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <span className="tag-code">{asset.assetTag}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {asset.brand} {asset.model}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Alım: {new Date(asset.purchaseDate).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {asset.category?.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#94a3b8' }}>
                        {asset.serialNumber}
                      </span>
                    </td>
                    <td>{getStatusBadge(asset.status)}</td>
                    <td>
                      {asset.currentUser ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#60a5fa' }}>
                            {asset.currentUser.fullName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {asset.currentUser.department}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      {asset.location || 'Merkez Depo'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* QR Etiketi Görüntüle / Yazdır */}
                        <button
                          className="btn btn-secondary btn-sm"
                          title="QR Kod / Barkod Etiketi"
                          onClick={() => handleShowQr(asset)}
                        >
                          <QrCode size={14} />
                        </button>

                        {/* Zimmet İşlemi Kısayolu (Admin) */}
                        {isAdmin && asset.status === 'AVAILABLE' && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Personele Zimmetle"
                            onClick={() => handleOpenAssign(asset)}
                          >
                            <UserCheck size={14} />
                            <span>Zimmetle</span>
                          </button>
                        )}

                        {isAdmin && asset.status === 'ASSIGNED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                            title="Zimmetten İade Al"
                            onClick={() => handleReturn(asset)}
                          >
                            <RotateCcw size={14} />
                            <span>İade Al</span>
                          </button>
                        )}

                        {/* Düzenle */}
                        {isAdmin && (
                          <button
                            className="btn btn-outline btn-sm"
                            title="Düzenle"
                            onClick={() => handleOpenEdit(asset)}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {/* Sil */}
                        {isAdmin && asset.status !== 'ASSIGNED' && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#ef4444' }}
                            title="Sil"
                            onClick={() => handleDelete(asset.id, `${asset.brand} ${asset.model}`)}
                          >
                            <Trash2 size={14} />
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      {/* Demirbaş Ekle / Düzenle Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingAsset ? 'Demirbaş Bilgilerini Düzenle' : 'Yeni Demirbaş Kaydı'}
        icon={<Boxes size={20} color="#3b82f6" />}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsFormModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit}>
              {editingAsset ? 'Güncelle' : 'Kaydet ve QR Üret'}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Marka *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Apple, Dell, Lenovo"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: MacBook Pro 16 M3"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Seri Numarası *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: C02G90XXMD6M"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori *</label>
              <select
                className="form-control"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Alım Tarihi *</label>
              <input
                type="date"
                className="form-control"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Garanti Bitiş Tarihi</label>
              <input
                type="date"
                className="form-control"
                value={formData.warrantyEndDate}
                onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Depo / Konum</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Merkez Depo - Raf A1"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alım Bedeli (₺)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Örn: 45000"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
          </div>

          {editingAsset && (
            <div className="form-group">
              <label className="form-label">Cihaz Durumu</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="AVAILABLE">Depoda (Kullanılabilir)</option>
                <option value="ASSIGNED">Zimmetli</option>
                <option value="IN_REPAIR">Arızalı / Bakımda</option>
                <option value="SCRAPPED">Hurda / Hizmet Dışı</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notlar ve Donanım Detayı</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="İşlemci, RAM, SSD veya özel tahsis notları..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Personele Zimmetleme Hızlı Modalı */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Personele Cihaz Zimmetleme"
        icon={<UserCheck size={20} color="#34d399" />}
        maxWidth="500px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsAssignModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-success" onClick={handleAssignSubmit}>
              Zimmeti Onayla
            </button>
          </>
        }
      >
        {assigningAsset && (
          <form onSubmit={handleAssignSubmit}>
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 12,
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 600 }}>Seçilen Cihaz:</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                {assigningAsset.brand} {assigningAsset.model}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                Etiket: {assigningAsset.assetTag} | Seri No: {assigningAsset.serialNumber}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teslim Edilecek Personel *</label>
              <select
                className="form-control"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Zimmet Notu / Tutanak Açıklaması</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Teslim sebebi, çalışma birimi, çanta/şarj cihazı aksesuarları vb."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* QR Etiket Yazdırma Modalı */}
      <QrCardModal
        isOpen={!!selectedAssetForQr}
        onClose={() => setSelectedAssetForQr(null)}
        asset={selectedAssetForQr}
      />
    </div>
  );
};
