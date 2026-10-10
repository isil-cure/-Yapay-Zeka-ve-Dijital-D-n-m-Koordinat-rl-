import React, { useEffect, useState, useRef } from 'react';
import { Modal } from './Modal';
import { Camera, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetFound: (asset: any) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onAssetFound,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { showToast } = useToast();

  const handleLookup = async (codeToSearch: string) => {
    try {
      setScanning(true);
      const asset = await api.lookupQr(codeToSearch);
      showToast(`${asset.brand} ${asset.model} bulundu!`, 'success');
      onAssetFound(asset);
      stopCamera();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Cihaz bulunamadı.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Başarılı tarama
          handleLookup(decodedText);
        },
        () => {
          // Frame tarandı ama barkod tespit edilmedi
        }
      );
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError('Kameraya erişilemedi veya izin verilmedi. Lütfen manuel barkod kodunu giriniz.');
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

  useEffect(() => {
    if (isOpen) {
      setManualCode('');
      setCameraError(null);
      // Modal açılınca kamerayı başlatmayı dene
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Canlı QR / Barkod Tarayıcı"
      icon={<Camera size={20} color="#06b6d4" />}
      maxWidth="500px"
    >
      <div>
        <div
          id="qr-reader-container"
          style={{
            width: '100%',
            minHeight: '260px',
            backgroundColor: '#0a0f1d',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2px dashed rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          {!cameraActive && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
              <Camera size={44} color="#06b6d4" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
              <p style={{ fontSize: '0.9rem' }}>
                {cameraError ? cameraError : 'Kamera başlatılıyor...'}
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>
          — VEYA BARKOD / SERİ NO İLE ARAYIN —
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCode.trim()) handleLookup(manualCode.trim());
          }}
          style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Örn: AST-2026-0001 veya C02G90XXMD6M"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            disabled={scanning}
            id="input-manual-barcode"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={scanning || !manualCode.trim()}
            id="btn-manual-search"
          >
            <Search size={16} />
            <span>Sorgula</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};
