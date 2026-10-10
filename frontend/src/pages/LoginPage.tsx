import React, { useState } from 'react';
import { authApi } from '../services/api';
import { User } from '../types';
import { Lock, Mail, Shield, User as UserIcon, LogIn, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`${demoEmail} bilgileri dolduruldu.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Arka plan ışık efektleri */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

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
                placeholder="admin@gop.edu.tr"
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

        {/* Jüri ve Değerlendirme Test Girişleri */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              DEĞERLENDİRME & JÜRİ TEST MODU
            </span>
            <span className="text-[10px] text-blue-400 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              Hızlı Doldur
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@gop.edu.tr', 'admin123')}
              className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-amber-500/50 group"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Yönetici (Admin)</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-1">admin@gop.edu.tr</div>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('personel@gop.edu.tr', 'personel123')}
              className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-blue-500/50 group"
            >
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Personel (Staff)</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-1">personel@gop.edu.tr</div>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center mt-3">
            🔒 Şifreler veritabanında tek yönlü bcrypt algoritmasıyla tuzlanarak (salt) şifrelenmiştir.
          </p>
        </div>

        {/* Geliştirici İmzası */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Geliştirici: <span className="font-semibold text-slate-400">Işıl Cüre</span>
        </div>
      </div>
    </div>
  );
};
