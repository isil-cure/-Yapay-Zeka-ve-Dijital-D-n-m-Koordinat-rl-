import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Users,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  summary: {
    totalAssets: number;
    assignedCount: number;
    availableCount: number;
    inRepairCount: number;
    scrappedCount: number;
    totalUsers: number;
    totalEstimatedValue: number;
  };
  categoryDistribution: Array<{
    id: string;
    name: string;
    code: string;
    count: number;
  }>;
  departmentDistribution: Array<{
    department: string;
    count: number;
  }>;
  recentLogs: Array<any>;
}

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
        <RefreshCw size={32} className="spin-animate" style={{ margin: '0 auto 1rem' }} />
        <p>İstatistikler ve envanter verileri yükleniyor...</p>
      </div>
    );
  }

  const { summary, categoryDistribution = [], departmentDistribution = [], recentLogs = [] } = stats || {
    summary: { totalAssets: 0, assignedCount: 0, availableCount: 0, inRepairCount: 0, scrappedCount: 0, totalUsers: 0, totalEstimatedValue: 0 },
    categoryDistribution: [],
    departmentDistribution: [],
    recentLogs: [],
  };

  return (
    <div>
      {/* Top Banner / Hero Info */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 20,
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            Kurumsal Donanım & Envanter Genel Görünümü
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
            Tüm IT cihazlarının durumu, aktif zimmetler ve anlık teknik servis süreçleri tek merkezden izlenmektedir.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchStats} title="Yenile">
          <RefreshCw size={14} />
          <span>Verileri Yenile</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="stat-grid">
        {/* Toplam Cihaz */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-inner">
            <div>
              <div className="stat-title">Toplam IT Donanımı</div>
              <div className="stat-value">{summary.totalAssets}</div>
              <div className="stat-subtext">Kayıtlı ve etiketlenmiş demirbaş</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Boxes size={24} />
            </div>
          </div>
        </div>

        {/* Depoda / Boşta */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-inner">
            <div>
              <div className="stat-title">Depoda / Boşta Bekleyen</div>
              <div className="stat-value" style={{ color: '#34d399' }}>{summary.availableCount}</div>
              <div className="stat-subtext">Zimmete hazır donanım</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Archive size={24} />
            </div>
          </div>
        </div>

        {/* Zimmetli */}
        <div className="stat-card" onClick={() => onNavigateTab('custody')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-inner">
            <div>
              <div className="stat-title">Personele Zimmetli</div>
              <div className="stat-value" style={{ color: '#60a5fa' }}>{summary.assignedCount}</div>
              <div className="stat-subtext">Aktif kullanımda olan donanım</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Arızalı / Bakımda */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-inner">
            <div>
              <div className="stat-title">Arızalı / Bakımda</div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>{summary.inRepairCount}</div>
              <div className="stat-subtext">Teknik servis ve onarım süreci</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Kategoriler & Son Zimmet Hareketleri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Kategori Dağılımı */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Boxes size={18} color="#3b82f6" />
              <span>Cihaz Kategori Dağılımı</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigateTab('assets')}>
              Tümü
            </button>
          </div>
          <div className="card-body">
            {categoryDistribution.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Kategori verisi bulunmuyor.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categoryDistribution.map((cat) => {
                  const percent = summary.totalAssets > 0 ? Math.round((cat.count / summary.totalAssets) * 100) : 0;
                  return (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.name}</span>
                        <span style={{ color: '#94a3b8' }}>
                          <strong style={{ color: '#60a5fa' }}>{cat.count}</strong> adet (%{percent})
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
                            borderRadius: 4,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Son Hareketler / Zimmet Akışı */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} color="#06b6d4" />
              <span>Son Zimmet & Servis Hareketleri</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigateTab('custody')}>
              Tüm Loglar
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentLogs.length === 0 ? (
              <p style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.88rem' }}>Henüz zimmet hareketi kaydedilmedi.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentLogs.map((log: any) => {
                  const isAssign = log.actionType === 'ASSIGN';
                  const isReturn = log.actionType === 'RETURN';
                  const isFault = log.actionType === 'REPORT_FAULT' || log.actionType === 'REPAIR_SENT';

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isAssign ? 'rgba(59, 130, 246, 0.15)' : isReturn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isAssign ? '#60a5fa' : isReturn ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {isAssign ? <FileText size={18} /> : isReturn ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                            {log.asset?.brand} {log.asset?.model}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {isAssign && `Zimmetlendi: ${log.user?.fullName || 'Personel'}`}
                            {isReturn && `İade Alındı: ${log.user?.fullName || 'Personel'}`}
                            {isFault && 'Arıza / Servis Süreci'}
                            {' • '}
                            <span style={{ color: '#64748b' }}>{new Date(log.actionDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`badge ${
                          isAssign ? 'badge-assigned' : isReturn ? 'badge-available' : 'badge-repair'
                        }`}
                      >
                        {isAssign ? 'Zimmet' : isReturn ? 'İade' : 'Arıza'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ek Bilgi: Departman Dağılımı ve Değer */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Users size={18} color="#8b5cf6" />
            <span>Departman Bazlı Zimmet Kullanımı</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Tahmini Toplam Envanter Değeri: <strong style={{ color: '#34d399' }}>₺{summary.totalEstimatedValue?.toLocaleString('tr-TR')}</strong>
          </div>
        </div>
        <div className="card-body">
          {departmentDistribution.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Henüz departmanlara atanmış aktif zimmet kaydı bulunmuyor.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {departmentDistribution.map((dept, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>{dept.department}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
                    {dept.count} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>cihaz</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
