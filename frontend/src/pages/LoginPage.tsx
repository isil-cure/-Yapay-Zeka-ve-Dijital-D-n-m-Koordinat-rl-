import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Boxes, Shield, User, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Lütfen e-posta ve şifrenizi giriniz.', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Sisteme başarıyla giriş yapıldı.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Giriş yapılamadı.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass)
      .then(() => showToast('Demo hesapla hızlı giriş yapıldı.', 'success'))
      .catch((e) => showToast(e.message, 'error'));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0b0f19 80%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Boxes size={32} />
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '4px' }}>
            T.C. Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            IT Demirbaş ve Zimmet Sistemi
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
            Kurumsal donanım ve envanter yönetim portalı
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Kurumsal E-Posta</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="ad.soyad@kurum.gov.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Şifre</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: 14 }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            disabled={loading}
            id="btn-login-submit"
          >
            <span>{loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Sparkles size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hızlı Değerlendirme Girişi (Demo Hesaplar)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
              onClick={() => handleQuickLogin('admin@kurum.gov.tr', 'Admin123!')}
              id="btn-demo-admin"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={14} color="#60a5fa" />
                <span style={{ fontWeight: 600 }}>Yönetici (Admin) Girişi</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Gökhan Yıldırım</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.6rem 0.85rem' }}
              onClick={() => handleQuickLogin('ahmet.yilmaz@kurum.gov.tr', 'Personel123!')}
              id="btn-demo-staff"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={14} color="#34d399" />
                <span style={{ fontWeight: 600 }}>Standart Personel Girişi</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ahmet Yılmaz (Yazılım)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
