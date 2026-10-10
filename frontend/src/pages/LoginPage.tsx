import React, { useState } from 'react';
import { authApi } from '../services/api';
import { User } from '../types';
import { Lock, Mail, LogIn, HelpCircle, Shield, User as UserIcon, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJuryModal, setShowJuryModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success(`Hoş geldiniz, ${res.user.fullName}!`);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillFromJuryModal = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setShowJuryModal(false);
    toast.success(`${demoEmail} bilgileri forma aktarıldı.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Arka plan ışık efektleri */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Üst Köşe: Jüri Değerlendirme Bilgilendirme Butonu */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setShowJuryModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-blue-400 hover:text-white hover:border-blue-500/60 font-medium text-xs shadow-lg backdrop-blur-md transition-all"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Jüri / Değerlendirme Bilgisi</span>
        </button>
      </div>

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white font-black text-2xl shadow-xl shadow-blue-600/20 mb-4">
            TOGU
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">IT Demirbaş ve Zimmet Sistemi</h2>
          <p className="text-xs text-slate-400 mt-1">Tokat Gaziosmanpaşa Üniversitesi</p>
          <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider mt-0.5">
            Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
          </p>
        </div>

        {/* Giriş Formu */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              KURUMSAL E-POSTA
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="ornek@gop.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              GÜVENLİ ŞİFRE
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Giriş Yapılıyor...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sisteme Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        {/* Güvenlik Bilgilendirmesi ve Alt Bilgi */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-400 font-medium">
            🔒 Tüm oturumlar JWT ve bcrypt şifreleme altyapısıyla korunmaktadır.
          </p>
          <div className="pt-2 text-xs text-slate-400">
            Geliştirici: <span className="font-semibold text-slate-300">Işıl Cüre</span>
          </div>
        </div>
      </div>

      {/* JÜRİ VE DEĞERLENDİRME BİLGİLENDİRME MODALI */}
      {showJuryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 overflow-hidden animate-scaleUp space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Değerlendirme Heyeti Kılavuzu</h3>
                  <p className="text-[11px] text-slate-400">Aday Mühendis Değerlendirme Projesi</p>
                </div>
              </div>
              <button
                onClick={() => setShowJuryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sayın Jüri Üyeleri ve Hocalarımız; sistemi tam yetki ve personel rolleriyle test edebilmeniz için ön tanımlı tohumlama (seed) hesapları aşağıdadır:
            </p>

            <div className="space-y-2.5">
              {/* Yönetici Hesabı */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Yönetici (Admin) Hesabı</span>
                  </div>
                  <p className="text-xs text-white font-mono mt-1">admin@gop.edu.tr</p>
                  <p className="text-[11px] text-slate-400 font-mono">Şifre: admin123</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillFromJuryModal('admin@gop.edu.tr', 'admin123')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
                >
                  Forma Aktar
                </button>
              </div>

              {/* Personel Hesabı */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Standart Personel (Staff)</span>
                  </div>
                  <p className="text-xs text-white font-mono mt-1">personel@gop.edu.tr</p>
                  <p className="text-[11px] text-slate-400 font-mono">Şifre: personel123</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillFromJuryModal('personel@gop.edu.tr', 'personel123')}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors"
                >
                  Forma Aktar
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowJuryModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
