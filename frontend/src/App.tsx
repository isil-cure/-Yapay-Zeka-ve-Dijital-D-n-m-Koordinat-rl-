import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsPage } from './pages/AssetsPage';
import { CustodyPage } from './pages/CustodyPage';
import { UsersPage } from './pages/UsersPage';
import { MyCustodyPage } from './pages/MyCustodyPage';
import { FieldScannerPage } from './pages/FieldScannerPage';
import { QrScannerModal } from './components/QrScannerModal';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickScanModalOpen, setIsQuickScanModalOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          color: '#94a3b8',
        }}
      >
        <RefreshCw size={36} className="spin-animate" color="#3b82f6" style={{ marginBottom: '1rem' }} />
        <p style={{ fontWeight: 600 }}>Sistem yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Gösterge Paneli', subtitle: 'Genel istatistikler ve anlık durum' };
      case 'assets':
        return { title: 'Demirbaş Envanteri', subtitle: 'Donanım listesi, filtreleme ve QR etiketleri' };
      case 'custody':
        return { title: 'Zimmet Yönetimi & Tarihçe', subtitle: 'Personele atama, iade ve denetim logları' };
      case 'my-assets':
        return { title: 'Kişisel Zimmetlerim', subtitle: 'Üzerinize kayıtlı donanımlar ve zimmet tutanağı' };
      case 'scanner':
        return { title: 'Saha QR Tarayıcı', subtitle: 'Canlı kamera tarama ve hızlı saha aksiyonları' };
      case 'users':
        return { title: 'Kullanıcı ve Rol Yönetimi', subtitle: 'Personel hesapları ve yetkilendirme' };
      default:
        return { title: 'IT Demirbaş ve Zimmet Sistemi', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="app-layout">
      {/* Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          // If staff tries to access users page, redirect to dashboard
          if (tab === 'users' && !isAdmin) {
            setCurrentTab('dashboard');
          } else {
            setCurrentTab(tab);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="main-wrapper">
        <Topbar
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsSidebarOpen(true)}
          onQuickScan={() => setIsQuickScanModalOpen(true)}
          onNewAsset={currentTab === 'assets' ? undefined : undefined}
        />

        <main className="content-body">
          {currentTab === 'dashboard' && <DashboardPage onNavigateTab={setCurrentTab} />}
          {currentTab === 'assets' && <AssetsPage />}
          {currentTab === 'custody' && <CustodyPage />}
          {currentTab === 'my-assets' && <MyCustodyPage />}
          {currentTab === 'scanner' && <FieldScannerPage />}
          {currentTab === 'users' && isAdmin && <UsersPage />}
        </main>
      </div>

      {/* Topbar Quick Scan Modal */}
      <QrScannerModal
        isOpen={isQuickScanModalOpen}
        onClose={() => setIsQuickScanModalOpen(false)}
        onAssetFound={(asset) => {
          setCurrentTab('scanner');
        }}
      />
    </div>
  );
};
