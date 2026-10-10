import React from 'react';
import { Modal } from './Modal';
import { QrCode, Printer, Download, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AssetQrInfo {
  id: string;
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  qrDataUrl: string;
  purchaseDate?: string;
  location?: string;
}

interface QrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetQrInfo | null;
}

export const QrCardModal: React.FC<QrCardModalProps> = ({ isOpen, onClose, asset }) => {
  const { showToast } = useToast();

  if (!asset) return null;

  const handlePrint = () => {
    window.print();
    showToast('Yazdırma penceresi açıldı.', 'info');
  };

  const handleDownload = () => {
    if (!asset.qrDataUrl) return;
    const link = document.createElement('a');
    link.href = asset.qrDataUrl;
    link.download = `QR-${asset.assetTag}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${asset.assetTag} QR kodu başarıyla indirildi.`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Demirbaş QR Kod & Barkod Etiketi"
      icon={<QrCode size={20} color="#3b82f6" />}
      maxWidth="480px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={16} />
            <span>QR İndir</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Etiket Yazdır</span>
          </button>
        </>
      }
    >
      <div className="printable-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: 16,
            padding: '24px 20px',
            width: '100%',
            maxWidth: '380px',
            border: '2px dashed #94a3b8',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1e3a8a', marginBottom: 4 }}>
            T.C. Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 12 }}>
            IT Demirbaş & Donanım Kimlik Kartı
          </div>

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, display: 'inline-block', marginBottom: 12 }}>
            <img
              src={asset.qrDataUrl}
              alt={`QR ${asset.assetTag}`}
              style={{ width: 180, height: 180, display: 'block', margin: '0 auto' }}
            />
          </div>

          <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.05em', marginBottom: 4 }}>
            {asset.assetTag}
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
            {asset.brand} {asset.model}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
            Seri No: <strong>{asset.serialNumber}</strong>
          </div>

          <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed #cbd5e1', fontSize: '0.7rem', color: '#94a3b8' }}>
            * Bu etiket demirbaş üzerinden sökülemez. Tarayarak durum ve zimmet bilgilerine erişebilirsiniz.
          </div>
        </div>
      </div>
    </Modal>
  );
};
