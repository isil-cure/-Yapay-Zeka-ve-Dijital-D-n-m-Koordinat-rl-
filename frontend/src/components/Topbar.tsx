import React from 'react';
import { Menu, QrCode, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onQuickScan: () => void;
  onNewAsset?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onQuickScan,
  onNewAsset,
}) => {
  const { isAdmin } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="btn-icon mobile-menu-btn btn-secondary"
          onClick={onOpenMobileMenu}
          aria-label="Menüyü Aç"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="page-heading">{title}</h1>
          {subtitle && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onQuickScan}
          title="Kamera ile QR Kod Okut"
          id="btn-quick-scan-topbar"
        >
          <QrCode size={16} />
          <span>Hızlı QR Tara</span>
        </button>

        {isAdmin && onNewAsset && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onNewAsset}
            id="btn-new-asset-topbar"
          >
            <PlusCircle size={16} />
            <span>Yeni Demirbaş</span>
          </button>
        )}
      </div>
    </header>
  );
};
