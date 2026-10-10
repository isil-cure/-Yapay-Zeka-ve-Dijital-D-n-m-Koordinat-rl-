import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import {
  FolderLock,
  Printer,
  AlertTriangle,
  Boxes,
  Calendar,
  Tag,
  ShieldCheck,
  FileCheck2,
  Send,
  RefreshCw
} from 'lucide-react';

export const MyCustodyPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Arıza Bildir Modalı
  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [reportingAsset, setReportingAsset] = useState<any | null>(null);
  const [faultType, setFaultType] = useState('Donanım Arızası');
  const [faultNotes, setFaultNotes] = useState('');

  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      const res = await api.getMyAssets();
      setMyAssets(res);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const handleOpenFaultReport = (asset: any) => {
    setReportingAsset(asset);
    setFaultType('Donanım Arızası');
    setFaultNotes('');
    setIsFaultModalOpen(true);
  };

  const handleFaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingAsset || !faultNotes.trim()) return;
    try {
      await api.reportFault({
        assetId: reportingAsset.id,
        faultType,
        notes: faultNotes,
      });
      showToast('Arıza bildirimi kaydedildi, teknik birime iletildi.', 'success');
      setIsFaultModalOpen(false);
      fetchMyAssets();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePrintHandover = () => {
    window.print();
    showToast('Zimmet tutanağı yazdırma penceresi açıldı.', 'info');
  };

  return (
    <div>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(139, 92, 246, 0.1))',
          borderColor: 'rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
            }}
          >
            <FolderLock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Personel Demirbaş Portalı
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              {user?.fullName} — Üzerinizdeki Zimmetli Cihazlar
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Departman: <strong>{user?.department}</strong> | Kayıtlı Cihaz: <strong>{myAssets.length} adet</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchMyAssets}>
            <RefreshCw size={14} />
            <span>Yenile</span>
          </button>
          {myAssets.length > 0 && (
            <button className="btn btn-primary btn-sm" onClick={handlePrintHandover}>
              <Printer size={14} />
              <span>Zimmet Tutanağını Yazdır</span>
            </button>
          )}
        </div>
      </div>

      {/* Cihaz Kartları Listesi */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
          Yükleniyor...
        </div>
      ) : myAssets.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Boxes size={48} color="#64748b" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            Üzerinize Tanımlı Zimmet Bulunmuyor
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: 460, margin: '0.5rem auto 0' }}>
            Kurum bünyesinde adınıza tahsis edilmiş aktif bir IT cihazı veya donanım bulunmamaktadır. İhtiyaç halinde IT yöneticiniz ile iletişime geçebilirsiniz.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {myAssets.map((asset) => (
            <div key={asset.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Boxes size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                      {asset.brand} {asset.model}
                    </div>
                    <span className="tag-code">{asset.assetTag}</span>
                  </div>
                </div>

                <span className="badge badge-assigned">Zimmetinizde</span>
              </div>

              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Kategori</span>
                    <strong style={{ color: '#cbd5e1' }}>{asset.category?.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Seri Numarası</span>
                    <strong style={{ color: '#93c5fd', fontFamily: 'monospace' }}>{asset.serialNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Alım Tarihi</span>
                    <span style={{ color: '#cbd5e1' }}>
                      {new Date(asset.purchaseDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Garanti Bitiş</span>
                    <span style={{ color: asset.warrantyEndDate ? '#cbd5e1' : '#64748b' }}>
                      {asset.warrantyEndDate
                        ? new Date(asset.warrantyEndDate).toLocaleDateString('tr-TR')
                        : 'Belirtilmedi'}
                    </span>
                  </div>
                </div>

                {asset.notes && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, padding: '0.65rem 0.85rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 2 }}>Donanım / Teslim Notu:</strong>
                    {asset.notes}
                  </div>
                )}
              </div>

              <div className="card-header" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'transparent' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Konum: {asset.location || 'Ofis'}
                </span>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                  onClick={() => handleOpenFaultReport(asset)}
                >
                  <AlertTriangle size={14} />
                  <span>Arıza Bildir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Arıza Bildir Modalı */}
      <Modal
        isOpen={isFaultModalOpen}
        onClose={() => setIsFaultModalOpen(false)}
        title="Donanım Arıza Bildirimi"
        icon={<AlertTriangle size={20} color="#fbbf24" />}
        maxWidth="500px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsFaultModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-primary" onClick={handleFaultSubmit}>
              <Send size={15} />
              <span>Arızayı Bildir</span>
            </button>
          </>
        }
      >
        {reportingAsset && (
          <form onSubmit={handleFaultSubmit}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 12,
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>Arızalı Cihaz:</div>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                {reportingAsset.brand} {reportingAsset.model}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                {reportingAsset.assetTag}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Arıza Türü *</label>
              <select
                className="form-control"
                value={faultType}
                onChange={(e) => setFaultType(e.target.value)}
              >
                <option value="Donanım Arızası">Donanım Arızası (Açılmıyor, Ekran, Klavye, Pil)</option>
                <option value="Yazılım / İşletim Sistemi">Yazılım / İşletim Sistemi Hatası</option>
                <option value="Ağ / Bağlantı Hatası">Ağ / Wi-Fi Bağlantı Problemi</option>
                <option value="Fiziksel Hasar / Sıvı Teması">Fiziksel Hasar / Düşme / Sıvı Teması</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Arıza Detayı ve Belirtiler *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Cihazda karşılaştığınız sorunu, hata mesajlarını detaylıca açıklayınız..."
                value={faultNotes}
                onChange={(e) => setFaultNotes(e.target.value)}
                required
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Yazdırılabilir Resmi Zimmet Tutanağı Şablonu (@media print) */}
      <div className="printable-area" style={{ display: 'none' }}>
        <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#000', background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase' }}>
              T.C. YAPAY ZEKA VE DİJİTAL DÖNÜŞÜM KOORDİNATÖRLÜĞÜ
            </h2>
            <h3 style={{ margin: '8px 0 0', fontSize: '15px' }}>
              BİLİŞİM TEKNOLOJİLERİ DONANIM VE ZİMMET TESLİM TUTANAĞI
            </h3>
          </div>

          <div style={{ marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
            <p><strong>Teslim Alan Personel:</strong> {user?.fullName}</p>
            <p><strong>Departman / Birim:</strong> {user?.department}</p>
            <p><strong>E-Posta:</strong> {user?.email}</p>
            <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Sıra</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Demirbaş No</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Marka & Model</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Seri No</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Kategori</th>
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a, idx) => (
                <tr key={a.id}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', fontFamily: 'monospace' }}>{a.assetTag}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{a.brand} {a.model}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', fontFamily: 'monospace' }}>{a.serialNumber}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{a.category?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ fontSize: '11px', lineHeight: '1.5', marginBottom: '40px' }}>
            Yukarıda özellikleri ve seri numaraları belirtilen bilişim donanımları, çalışır ve eksiksiz vaziyette kurum görev ve sorumlulukları çerçevesinde kullanılmak üzere tarafıma teslim edilmiştir. Cihazların korunması ve kurum politikalarına uygun kullanımı şahsıma aittir.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', fontSize: '13px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <p><strong>Teslim Eden</strong></p>
              <p>IT & Sistem Yöneticisi</p>
              <p style={{ marginTop: '50px' }}>İmza: .........................</p>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <p><strong>Teslim Alan</strong></p>
              <p>{user?.fullName}</p>
              <p style={{ marginTop: '50px' }}>İmza: .........................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
