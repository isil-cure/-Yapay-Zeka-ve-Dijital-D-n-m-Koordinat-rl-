import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Edit2,
  Trash2,
  Mail,
  Building,
  Phone,
  Boxes
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modallar
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    department: '',
    role: 'STAFF',
    phone: '',
    isActive: true,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getUsers({
        search,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
      });
      setUsers(res);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      department: 'Yazılım ve Yapay Zeka',
      role: 'STAFF',
      phone: '',
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      fullName: user.fullName,
      department: user.department,
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          fullName: formData.fullName,
          department: formData.department,
          role: formData.role,
          phone: formData.phone,
          isActive: formData.isActive,
        });
        showToast('Kullanıcı bilgileri güncellendi.', 'success');
      } else {
        await api.createUser(formData);
        showToast('Yeni kullanıcı başarıyla eklendi.', 'success');
      }
      setIsFormModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenPasswordReset = (user: any) => {
    setPasswordTargetUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPassword) return;
    try {
      await api.resetUserPassword(passwordTargetUser.id, { newPassword });
      showToast(`${passwordTargetUser.fullName} kullanıcısının şifresi başarıyla sıfırlandı.`, 'success');
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" adlı kullanıcıyı sistemden silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteUser(id);
      showToast('Kullanıcı silindi.', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Mevcut benzersiz departmanlar
  const departments = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));

  return (
    <div>
      {/* Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: '1 1 320px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                className="form-control"
                placeholder="Ad soyad, e-posta veya departmanda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                id="input-user-search"
              />
            </div>

            <div style={{ minWidth: 200 }}>
              <select
                className="form-control"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                id="select-user-dept-filter"
              >
                <option value="ALL">Tüm Departmanlar</option>
                {departments.map((d, i) => (
                  <option key={i} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleOpenAdd} id="btn-add-user">
            <UserPlus size={18} />
            <span>Yeni Kullanıcı Ekle</span>
          </button>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personel / Yetkili</th>
                <th>E-Posta Adresi</th>
                <th>Departman</th>
                <th>Rol</th>
                <th>Zimmetli Cihaz Sayısı</th>
                <th>Durum</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: '0.82rem' }}>
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                              {u.fullName} {isCurrent && <span style={{ color: '#60a5fa', fontSize: '0.75rem' }}>(Siz)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {u.phone || 'Telefon kaydı yok'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{u.email}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{u.department}</span>
                      </td>
                      <td>
                        {u.role === 'ADMIN' ? (
                          <span className="badge badge-assigned">
                            <ShieldCheck size={12} /> Yönetici (Admin)
                          </span>
                        ) : (
                          <span className="badge badge-neutral">Standart Personel</span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: u._count?.assignedAssets > 0 ? '#60a5fa' : '#64748b',
                            fontSize: '0.9rem',
                          }}
                        >
                          {u._count?.assignedAssets || 0} adet
                        </span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge badge-available">Aktif</span>
                        ) : (
                          <span className="badge badge-scrapped">Pasif</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Şifre Sıfırla"
                            onClick={() => handleOpenPasswordReset(u)}
                          >
                            <KeyRound size={14} />
                          </button>

                          <button
                            className="btn btn-outline btn-sm"
                            title="Düzenle"
                            onClick={() => handleOpenEdit(u)}
                          >
                            <Edit2 size={14} />
                          </button>

                          {!isCurrent && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: '#ef4444' }}
                              title="Sil"
                              onClick={() => handleDelete(u.id, u.fullName)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kullanıcı Ekle / Düzenle Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingUser ? 'Kullanıcı Bilgilerini Düzenle' : 'Yeni Kullanıcı Oluştur'}
        icon={<Users size={20} color="#3b82f6" />}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsFormModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit}>
              {editingUser ? 'Güncelle' : 'Kullanıcıyı Kaydet'}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Ad ve Soyad *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Örn: Mehmet Özkan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">E-Posta Adresi *</label>
              <input
                type="email"
                className="form-control"
                placeholder="ad.soyad@kurum.gov.tr"
                value={formData.email}
                disabled={!!editingUser}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {!editingUser && (
              <div className="form-group">
                <label className="form-label">Başlangıç Şifresi *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Departman / Birim *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Yazılım ve Yapay Zeka"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon Numarası</label>
              <input
                type="text"
                className="form-control"
                placeholder="+90 5xx xxx xx xx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Yetki Rolü *</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="STAFF">Standart Personel</option>
                <option value="ADMIN">Sistem Yöneticisi (Admin)</option>
              </select>
            </div>

            {editingUser && (
              <div className="form-group">
                <label className="form-label">Hesap Durumu</label>
                <select
                  className="form-control"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif (Giriş Engelli)</option>
                </select>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Şifre Sıfırlama Modalı */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Kullanıcı Şifresini Sıfırla"
        icon={<KeyRound size={20} color="#fbbf24" />}
        maxWidth="440px"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setIsPasswordModalOpen(false)}>
              İptal
            </button>
            <button className="btn btn-primary" onClick={handlePasswordSubmit}>
              Şifreyi Güncelle
            </button>
          </>
        }
      >
        {passwordTargetUser && (
          <form onSubmit={handlePasswordSubmit}>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              <strong style={{ color: '#f8fafc' }}>{passwordTargetUser.fullName}</strong> kullanıcısı için yeni bir parola belirleyiniz.
            </p>

            <div className="form-group">
              <label className="form-label">Yeni Parola *</label>
              <input
                type="password"
                className="form-control"
                placeholder="En az 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
