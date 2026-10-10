import React from 'react';
import { User } from '../types';
import { LayoutDashboard, Layers, Users, QrCode, ShieldCheck, Heart, ExternalLink, X } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: User | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isOpen = false,
  onClose,
}) => {
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { id: 'dashboard', label: 'Genel Bakış & Özet', icon: LayoutDashboard },
    { id: 'assets', label: 'Demirbaş Envanteri', icon: Layers },
    { id: 'scanner', label: 'QR Okuma & Saha Modu', icon: QrCode },
    { id: 'my-assets', label: 'Kişisel Zimmetlerim', icon: ShieldCheck },
    ...(isAdmin ? [{ id: 'users', label: 'Personel & Yetki', icon: Users }] : []),
  ];

  return (
    <>
      {/* Mobil Karartma Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Başlık & Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black text-xl">
              TOGU
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">IT ZİMMET SİSTEMİ</div>
              <div className="text-[10px] text-blue-400 font-semibold tracking-wider">v2.0 PRODUCTION</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menü Öğeleri */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            YÖNETİM MODÜLLERİ
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            KURUMSAL BİLGİ
          </div>
          <div className="px-3.5 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Tokat Gaziosmanpaşa Üniv.</p>
            <p className="text-[11px] text-slate-400">Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü</p>
          </div>
        </nav>

        {/* Geliştirici Künyesi (Developer Footer) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              IC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Işıl Cüre</p>
              <a
                href="https://github.com/isil-cure"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <span>github.com/isil-cure</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
