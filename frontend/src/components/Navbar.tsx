import React from 'react';
import { User } from '../types';
import { LogOut, User as UserIcon, Shield, Menu, Monitor } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            aria-label="Menüyü Aç"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white tracking-tight">TOGU IT Demirbaş ve Zimmet</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Yapay Zeka ve Dijital Dönüşüm</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-full py-1.5 px-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user.fullName}</p>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role === 'ADMIN' ? 'YÖNETİCİ' : 'PERSONEL'}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.department}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 hover:text-white transition-colors"
          title="Oturumu Kapat"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
};
