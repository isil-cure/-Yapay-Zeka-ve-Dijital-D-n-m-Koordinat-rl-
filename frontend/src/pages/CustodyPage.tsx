import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import {
  FileCheck2,
  Search,
  Filter,
  UserCheck,
  RotateCcw,
  AlertTriangle,
  History,
  FileText,
  User,
  ShieldCheck,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const CustodyPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Zimmetleme Sihirbazı Modalı
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // İade Alma Sihirbazı Modalı
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [assignedAssets, setAssignedAssets] = useState<any[]>([]);
  const [returnAssetId, setReturnAssetId] = useState('');
  const [returnLocation, setReturnLocation] = useState('Merkez Depo');
  const [returnStatus, setReturnStatus] = useState('AVAILABLE');
  const [returnNotes, setReturnNotes] = useState('');

  // Log Detay Modalı
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCustodyLogs({
        page,
        limit: 12,
        search,
        actionType: actionFilter,
      });
      setLogs(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.total);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const loadAssignData = async () => {
    try {
      const [assetRes, userList] = await Promise.all([
        api.getAssets({ status: 'AVAILABLE', limit: 100 }),
        api.getUsers(),
      ]);
      setAvailableAssets(assetRes.data);
      setUsers(userList);
      if (assetRes.data.length > 0) setSelectedAssetId(assetRes.data[0].id);
      if (userList.length > 0) setSelectedUserId(userList[0].id);
      setIsAssignModalOpen(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const loadReturnData = async () => {
    try {
      const assetRes = await api.getAssets({ status: 'ASSIGNED', limit: 100 });
      setAssignedAssets(assetRes.data);
      if (assetRes.data.length > 0) setReturnAssetId(assetRes.data[0].id);
      setIsReturnModalOpen(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedUserId) return;
    try {
      await api.assignAsset({
        assetId: selectedAssetId,
        userId: selectedUserId,
        notes: assignNotes,
      });
      showToast('Zimmet ataması başarıyla kaydedildi.', 'success');
      setIsAssignModalOpen(false);
      setAssignNotes('');
      fetchLogs();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnAssetId) return;
    try {
      await api.returnAsset({
        assetId: returnAssetId,
        newStatus: returnStatus,
        returnLocation,
        notes: returnNotes,
      });
      showToast('Cihaz iadesi başarıyla kaydedildi.', 'success');
      setIsReturnModalOpen(false);
      setReturnNotes('');
      fetchLogs();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'ASSIGN':
        return <span className="badge badge-assigned"><UserCheck size={12} /> Zimmet Teslimi</span>;
      case 'RETURN':
        return <span className="badge badge-available"><RotateCcw size={12} /> İade Alındı</span>;
      case 'REPORT_FAULT':
      case 'REPAIR_SENT':
        return <span className="badge badge-repair"><AlertTriangle size={12} /> Servis / Arıza</span>;
      case 'SCRAP':
        return <span className="badge badge-scrapped">Hurdaya Ayrıldı</span>;
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  return (
    <div>
      {/* Top Banner Actions (Admin) */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(17, 24, 39, 0.6))',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>Yeni Zimmetleme</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Depodaki cihazı personele tahsis et</div>
            </div>
            <button className="btn btn-primary" onClick={loadAssignData} id="btn-open-assign-wizard">
              <UserCheck size={16} />
              <span>Zimmetle</span>
            </button>
          </div>

          <div
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(17, 24, 39, 0.6))',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>Zimmetten İade Al</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Personelden cihazı geri teslim al</div>
            </div>
            <button className="btn btn-success" onClick={loadReturnData} id="btn-open-return-wizard">
              <RotateCcw size={16} />
              <span>İade Al</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar / Search & Filter */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Tutanak no, cihaz, personel veya notlarda ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
              id="input-custody-search"
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <select
              className="form-control"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              id="select-action-filter"
            >
              <option value="ALL">Tüm Hareket Türleri</option>
              <option value="ASSIGN">Zimmet Teslimleri</option>
              <option value="RETURN">İade Kabul İşlemleri</option>
              <option value="REPORT_FAULT">Arıza / Servis Süreçleri</option>
              <option value="SCRAP">Hurda İşlemleri</option>
            </select>
          </div>
        </div>
      </div>

      {/* Zimmet Tarihçesi Tablosu */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <History size={18} color="#3b82f6" />
            <span>Zimmet Denetim & Hareket Tarihçesi (Audit Trail)</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tutanak No</th>
                <th>İşlem Türü</th>
                <th>İlgili Cihaz</th>
                <th>Personel / Departman</th>
                <th>İşlemi Yapan</th>
                <th>Açıklama / Not</th>
                <th>Tarih</th>
                <th style={{ textAlign: 'right' }}>Detay</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Zimmet hareket kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="tag-code">{log.documentNo || 'ZMT-LOG'}</span>
                    </td>
                    <td>{getActionBadge(log.actionType)}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {log.asset?.brand} {log.asset?.model}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {log.asset?.assetTag}
                      </div>
                    </td>
                    <td>
                      {log.user ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{log.user.fullName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.user.department}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        {log.performedBy?.fullName || 'Sistem'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: '#cbd5e1',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 260,
                        }}
                        title={log.notes}
                      >
                        {log.notes || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {new Date(log.actionDate).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedLog(log)}
                        title="Tutanak Detayını İncele"
                      >
                        <FileText size={14} />
                      </button>
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
          pageSize={12}
          onPageChange={setPage}
        />
      </div>

      {/* Zimmetleme Modalı */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Personele Cihaz Zimmetleme Sihirbazı"
        icon={<UserCheck size={20} color="#3b82f6" />}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsAssignModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-primary" onClick={handleAssignSubmit}>
              Zimmeti Onayla ve Belgeyi Oluştur
            </button>
          </>
        }
      >
        <form onSubmit={handleAssignSubmit}>
          {availableAssets.length === 0 ? (
            <p style={{ color: '#fbbf24', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 10 }}>
              Şu anda depoda zimmetlenebilecek boşta cihaz bulunmuyor.
            </p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Zimmetlenecek Cihaz *</label>
                <select
                  className="form-control"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  required
                >
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.assetTag}] {a.brand} {a.model} (SN: {a.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Teslim Edilecek Personel *</label>
                <select
                  className="form-control"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} — {u.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Zimmet Tutanak Notu</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Cihaz çantası, adaptörü ile eksiksiz teslim edilmiştir. Yazılım geliştirme amacıyla kullanılacaktır."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* İade Alma Modalı */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Zimmetten İade Alma Sihirbazı"
        icon={<RotateCcw size={20} color="#10b981" />}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsReturnModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-success" onClick={handleReturnSubmit}>
              İadeyi Kabul Et ve Depoya Al
            </button>
          </>
        }
      >
        <form onSubmit={handleReturnSubmit}>
          {assignedAssets.length === 0 ? (
            <p style={{ color: '#fbbf24', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 10 }}>
              Şu anda zimmette olan cihaz bulunmamaktadır.
            </p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">İade Alınacak Cihaz *</label>
                <select
                  className="form-control"
                  value={returnAssetId}
                  onChange={(e) => setReturnAssetId(e.target.value)}
                  required
                >
                  {assignedAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.assetTag}] {a.brand} {a.model} — (Zimmetli: {a.currentUser?.fullName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">İade Sonrası Durum</label>
                <select
                  className="form-control"
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Depoya Al (Kullanıma Hazır)</option>
                  <option value="IN_REPAIR">Teknik Servise Gönder (Arızalı İade)</option>
                  <option value="SCRAPPED">Hurdaya Ayır (Kullanım Dışı)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Geri Teslim Depo / Raf Konumu</label>
                <input
                  type="text"
                  className="form-control"
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  placeholder="Örn: Merkez Depo - Raf B3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">İade Notu</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Personel görevi tamamlandığından cihaz eksiksiz geri teslim alınmıştır."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Log Detay Modalı */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Zimmet Hareket Tutanak Detayı"
        icon={<FileText size={20} color="#60a5fa" />}
        maxWidth="500px"
      >
        {selectedLog && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Tutanak Belge Numarası
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace' }}>
                {selectedLog.documentNo || 'ZMT-LOG'}
              </div>
              <div style={{ marginTop: 6 }}>{getActionBadge(selectedLog.actionType)}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İlgili Cihaz:</span>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                  {selectedLog.asset?.brand} {selectedLog.asset?.model}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  Etiket: {selectedLog.asset?.assetTag} | Seri No: {selectedLog.asset?.serialNumber}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İlgili Personel:</span>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                  {selectedLog.user ? `${selectedLog.user.fullName} (${selectedLog.user.department})` : '—'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>İşlemi Yapan Yetkili:</span>
                <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                  {selectedLog.performedBy?.fullName}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tarih & Saat:</span>
                <div style={{ fontWeight: 500, color: '#cbd5e1' }}>
                  {new Date(selectedLog.actionDate).toLocaleString('tr-TR')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Açıklama / Tutanak Notu:</span>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', marginTop: 2, background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                  {selectedLog.notes || 'Açıklama girilmedi.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
