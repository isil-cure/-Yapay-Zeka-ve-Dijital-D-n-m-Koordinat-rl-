import React, { useState, useEffect } from 'react';
import { User } from './types';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsPage } from './pages/AssetsPage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AddAssetModal } from './components/AddAssetModal';
import { authApi } from './services/api';
import toast from 'react-hot-toast';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState<boolean>(false);

  // Oturum kontrolü
  useEffect(() => {
    if (token) {
      authApi.getMe().catch(() => {
        handleLogout();
      });
    }
  }, [token]);

  const handleLoginSuccess = (loggedInUser: User, receivedToken: string) => {
    setUser(loggedInUser);
    setToken(receivedToken);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setSelectedAssetId(null);
    toast.success('Oturum kapatıldı.');
  };

  if (!token || !user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === 'ADMIN';

  const navigateToAssetsWithFilter = (status?: string) => {
    setStatusFilter(status || '');
    setCurrentTab('assets');
    setSelectedAssetId(null);
  };

  const navigateToAssetDetail = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentTab('asset-detail');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Yan Menü (Sidebar) */}
      <Sidebar
        currentTab={currentTab === 'asset-detail' ? 'assets' : currentTab}
        onSelectTab={(tab) => {
          setSelectedAssetId(null);
          setCurrentTab(tab);
        }}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Ana Gövde */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Üst Bar (Navbar) */}
        <Navbar
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* İçerik Alanı */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateAssets={navigateToAssetsWithFilter}
              onOpenAddModal={() => setIsAddAssetModalOpen(true)}
              isAdmin={isAdmin}
            />
          )}

          {currentTab === 'assets' && (
            <AssetsPage
              initialStatusFilter={statusFilter}
              onOpenAddModal={() => setIsAddAssetModalOpen(true)}
              onSelectAssetDetail={navigateToAssetDetail}
              isAdmin={isAdmin}
            />
          )}

          {currentTab === 'asset-detail' && selectedAssetId && (
            <AssetDetailPage
              assetId={selectedAssetId}
              onBack={() => {
                setSelectedAssetId(null);
                setCurrentTab('assets');
              }}
              isAdmin={isAdmin}
            />
          )}

          {currentTab === 'users' && isAdmin && <UserManagementPage />}
        </main>
      </div>

      {/* Demirbaş Ekleme Modalı */}
      {isAddAssetModalOpen && (
        <AddAssetModal
          isOpen={isAddAssetModalOpen}
          onClose={() => setIsAddAssetModalOpen(false)}
          onSuccess={() => {
            // Aktif sekmedeki veriyi tazelemek için
            if (currentTab === 'assets') {
              setCurrentTab('dashboard');
              setTimeout(() => setCurrentTab('assets'), 50);
            } else {
              setCurrentTab('assets');
            }
          }}
        />
      )}
    </div>
  );
};
