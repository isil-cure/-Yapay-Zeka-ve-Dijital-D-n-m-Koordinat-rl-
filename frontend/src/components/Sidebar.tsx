import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  FileCheck2,
  Users,
  QrCode,
  ShieldCheck,
  LogOut,
  FolderLock,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <Boxes size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="brand-text-title">IT DEMİRBAŞ</div>
          <div className="brand-text-sub">Zimmet Yönetimi</div>
        </div>
        <button
          className="btn-icon mobile-menu-btn"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8' }}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Ana Menü</div>

        <button
          className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNav('dashboard')}
          id="nav-dashboard"
        >
          <LayoutDashboard size={18} />
          <span>Gösterge Paneli</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'assets' ? 'active' : ''}`}
          onClick={() => handleNav('assets')}
          id="nav-assets"
        >
          <Boxes size={18} />
          <span>Demirbaş Envanteri</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'custody' ? 'active' : ''}`}
          onClick={() => handleNav('custody')}
          id="nav-custody"
        >
          <FileCheck2 size={18} />
          <span>Zimmet & Geçmiş</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'my-assets' ? 'active' : ''}`}
          onClick={() => handleNav('my-assets')}
          id="nav-my-assets"
        >
          <FolderLock size={18} />
          <span>Kişisel Zimmetlerim</span>
        </button>

        <div className="nav-section-title">Saha & Mobil Modu</div>

        <button
          className={`nav-item ${currentTab === 'scanner' ? 'active' : ''}`}
          onClick={() => handleNav('scanner')}
          id="nav-scanner"
        >
          <QrCode size={18} />
          <span>Saha QR Tarayıcı</span>
        </button>

        {isAdmin && (
          <>
            <div className="nav-section-title">Yönetim (Admin)</div>

            <button
              className={`nav-item ${currentTab === 'users' ? 'active' : ''}`}
              onClick={() => handleNav('users')}
              id="nav-users"
            >
              <Users size={18} />
              <span>Kullanıcı Yönetimi</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-info-name" title={user?.fullName}>{user?.fullName}</div>
            <div className="user-info-role">
              {isAdmin ? (
                <>
                  <ShieldCheck size={12} color="#3b82f6" />
                  <span style={{ color: '#60a5fa' }}>Yönetici (Admin)</span>
                </>
              ) : (
                <span>Personel</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          id="btn-logout"
        >
          <LogOut size={15} />
          <span>Güvenli Çıkış</span>
        </button>
      </div>
    </aside>
  );
};
