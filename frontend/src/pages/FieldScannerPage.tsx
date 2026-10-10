import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Boxes,
  ShieldCheck,
  Calendar,
  Building,
  User,
  QrCode
} from 'lucide-react';

export const FieldScannerPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeAsset, setActiveAsset] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Saha Aksiyon Form State
  const [actionTab, setActionTab] = useState<'DETAILS' | 'ASSIGN' | 'RETURN' | 'FAULT'>('DETAILS');
  const [targetUserId, setTargetUserId] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    api.getUsers()
      .then((data) => {
        setUsers(data);
        if (data.length > 0) setTargetUserId(data[0].id);
      })
      .catch(console.error);

    return () => {
      stopCamera();
    };
  }, []);

  const handleLookup = async (code: string) => {
    if (!code) return;
    try {
      setLoading(true);
      const res = await api.lookupQr(code);
      setActiveAsset(res);
      setActionTab('DETAILS');
      setActionNotes('');
      showToast(`${res.brand} ${res.model} tespit edildi!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Cihaz bulunamadı.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const html5QrCode = new Html5Qrcode('field-qr-camera');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        (decodedText) => {
          handleLookup(decodedText);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError('Kamera başlatılamadı. Cihaz izinlerini kontrol ediniz veya alttan barkod giriniz.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error(e);
      }
    }
    scannerRef.current = null;
    setCameraActive(false);
  };

  const handleExecuteQuickAction = async (actionType: 'ASSIGN' | 'RETURN' | 'REPORT_FAULT') => {
    if (!activeAsset) return;
    try {
      setActionLoading(true);
      await api.quickAction({
        assetId: activeAsset.id,
        actionType,
        targetUserId: actionType === 'ASSIGN' ? targetUserId : undefined,
        notes: actionNotes,
      });

      showToast('Saha işlemi başarıyla kaydedildi!', 'success');
      // Güncel veriyi yeniden çek
      const updated = await api.lookupQr(activeAsset.assetTag);
      setActiveAsset(updated);
      setActionTab('DETAILS');
      setActionNotes('');
    } catch (err: any) {
      showToast(err.message || 'İşlem başarısız oldu.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header Info */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(37, 99, 235, 0.12))',
          borderColor: 'rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mobil & Saha Yönetim Modülü
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
            Canlı QR Okuma ve Sahada Hızlı İşlem
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Cihaz üzerindeki QR kodu telefon/tablet kamerasıyla okutarak detayları anında görün ve teslim/iade/arıza işlemlerini tamamlayın.
          </p>
        </div>

        <button
          className={`btn ${cameraActive ? 'btn-danger' : 'btn-primary'}`}
          onClick={cameraActive ? stopCamera : startCamera}
          id="btn-toggle-camera"
        >
          <Camera size={18} />
          <span>{cameraActive ? 'Kamerayı Kapat' : 'Kamerayı Başlat'}</span>
        </button>
      </div>

      {/* Camera Viewport & Manual Form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div
          id="field-qr-camera"
          style={{
            width: '100%',
            minHeight: cameraActive ? '320px' : '160px',
            backgroundColor: '#0a0f1d',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px dashed rgba(6, 182, 212, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          {!cameraActive && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
              <QrCode size={48} color="#06b6d4" style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', fontWeight: 600 }}>
                {cameraError || 'Kamera kapalı. Yukarıdaki "Kamerayı Başlat" butonuna basarak QR taratabilirsiniz.'}
              </p>
            </div>
          )}
        </div>

        {/* Manuel Arama Çubuğu */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(manualInput.trim());
          }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Örn: AST-2026-0001 veya seri no (C02G90XXMD6M)..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            disabled={loading}
            id="input-field-search"
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !manualInput.trim()} id="btn-field-lookup">
            <Search size={16} />
            <span>Sorgula</span>
          </button>
        </form>
      </div>

      {/* Bulunan Cihaz Detay Kartı ve Hızlı Aksiyon Paneli */}
      {activeAsset && (
        <div className="card" style={{ animation: 'scaleUp 0.25s ease-out' }}>
          <div className="card-header" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Boxes size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeAsset.brand} {activeAsset.model}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="tag-code">{activeAsset.assetTag}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    SN: {activeAsset.serialNumber}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {activeAsset.status === 'AVAILABLE' && <span className="badge badge-available">Depoda (Boşta)</span>}
              {activeAsset.status === 'ASSIGNED' && <span className="badge badge-assigned">Zimmetli</span>}
              {activeAsset.status === 'IN_REPAIR' && <span className="badge badge-repair">Arızalı / Serviste</span>}
              {activeAsset.status === 'SCRAPPED' && <span className="badge badge-scrapped">Hurda</span>}
            </div>
          </div>

          {/* Action Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <button
              onClick={() => setActionTab('DETAILS')}
              style={{
                flex: 1,
                padding: '0.85rem',
                background: actionTab === 'DETAILS' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: 'none',
                borderBottom: actionTab === 'DETAILS' ? '2px solid #3b82f6' : 'none',
                color: actionTab === 'DETAILS' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cihaz Bilgileri
            </button>

            {isAdmin && activeAsset.status !== 'ASSIGNED' && activeAsset.status !== 'SCRAPPED' && (
              <button
                onClick={() => setActionTab('ASSIGN')}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: actionTab === 'ASSIGN' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: actionTab === 'ASSIGN' ? '2px solid #60a5fa' : 'none',
                  color: actionTab === 'ASSIGN' ? '#60a5fa' : '#94a3b8',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Personele Teslim Et
              </button>
            )}

            {isAdmin && activeAsset.status === 'ASSIGNED' && (
              <button
                onClick={() => setActionTab('RETURN')}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: actionTab === 'RETURN' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: actionTab === 'RETURN' ? '2px solid #34d399' : 'none',
                  color: actionTab === 'RETURN' ? '#34d399' : '#94a3b8',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cihazı Geri Kabul Et
              </button>
            )}

            <button
              onClick={() => setActionTab('FAULT')}
              style={{
                flex: 1,
                padding: '0.85rem',
                background: actionTab === 'FAULT' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: actionTab === 'FAULT' ? '2px solid #fbbf24' : 'none',
                color: actionTab === 'FAULT' ? '#fbbf24' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Arıza Durumu Bildir
            </button>
          </div>

          <div className="card-body">
            {/* TAB: DETAILS */}
            {actionTab === 'DETAILS' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Kategori:</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{activeAsset.category?.name}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Alım Tarihi:</span>
                  <div style={{ color: '#cbd5e1' }}>
                    {new Date(activeAsset.purchaseDate).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Garanti Bitiş:</span>
                  <div style={{ color: activeAsset.warrantyEndDate ? '#cbd5e1' : '#64748b' }}>
                    {activeAsset.warrantyEndDate
                      ? new Date(activeAsset.warrantyEndDate).toLocaleDateString('tr-TR')
                      : 'Kayıt yok'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Şu Anda Kimde:</span>
                  <div style={{ fontWeight: 700, color: activeAsset.currentUser ? '#60a5fa' : '#34d399' }}>
                    {activeAsset.currentUser
                      ? `${activeAsset.currentUser.fullName} (${activeAsset.currentUser.department})`
                      : 'Kimseye Zimmetli Değil (Depoda)'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Mevcut Konum:</span>
                  <div style={{ color: '#cbd5e1' }}>{activeAsset.location || 'Depo'}</div>
                </div>

                {activeAsset.notes && (
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Notlar:</span>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{activeAsset.notes}</div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ASSIGN (Personele Teslim Et) */}
            {actionTab === 'ASSIGN' && (
              <div>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Sahada okutulan cihazı anında bir personele teslim ediniz.
                </p>

                <div className="form-group">
                  <label className="form-label">Teslim Alan Personel *</label>
                  <select
                    className="form-control"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Saha Teslim Notu</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Sahada elden teslim edildi..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  disabled={actionLoading}
                  onClick={() => handleExecuteQuickAction('ASSIGN')}
                >
                  <UserCheck size={16} />
                  <span>Personele Teslim Et ve Zimmetle</span>
                </button>
              </div>
            )}

            {/* TAB: RETURN (Geri Kabul Et) */}
            {actionTab === 'RETURN' && (
              <div>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Cihaz {activeAsset.currentUser?.fullName} personeli üzerinden geri alınıp depoya kaydedilecektir.
                </p>

                <div className="form-group">
                  <label className="form-label">İade / Teslim Notu</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Sahada personelden sağlam teslim alındı..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-success"
                  disabled={actionLoading}
                  onClick={() => handleExecuteQuickAction('RETURN')}
                >
                  <RotateCcw size={16} />
                  <span>Cihazı Sahada Geri Kabul Et</span>
                </button>
              </div>
            )}

            {/* TAB: FAULT (Arıza Bildir) */}
            {actionTab === 'FAULT' && (
              <div>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Cihazın durumu "Arızalı / Bakımda" olarak güncellenecek ve teknik servis kaydı oluşturulacaktır.
                </p>

                <div className="form-group">
                  <label className="form-label">Arıza Açıklaması *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Sahada tespit edilen arıza veya hasar detayları..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="btn btn-danger"
                  disabled={actionLoading || !actionNotes.trim()}
                  onClick={() => handleExecuteQuickAction('REPORT_FAULT')}
                >
                  <AlertTriangle size={16} />
                  <span>Arıza Kaydını Aç ve Servise Gönder</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
