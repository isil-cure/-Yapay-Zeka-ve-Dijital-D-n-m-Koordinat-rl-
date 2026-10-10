import React, { useState, useEffect } from 'react';
import { userApi, authApi } from '../services/api';
import { User, Role } from '../types';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Edit2,
  RefreshCw,
  Mail,
  Building,
  Lock,
  X,
  Laptop,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Yeni Kullanıcı Ekleme Modalı
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<Role>('STAFF');
  const [submitting, setSubmitting] = useState(false);

  // Kullanıcı Düzenleme Modalı
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<Role>('STAFF');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err: any) {
      toast.error('Kullanıcı listesi getirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPassword || !newDepartment) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.register({
        fullName: newFullName,
        email: newEmail,
        password: newPassword,
        department: newDepartment,
        role: newRole,
      });

      toast.success(`"${newFullName}" personeli başarıyla sisteme kaydedildi.`);
      setShowAddModal(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setNewDepartment('');
      setNewRole('STAFF');
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Personel kaydı başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editPassword && editPassword.trim().length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      await userApi.update(editingUser.id, {
        fullName: editFullName,
        department: editDepartment,
        role: editRole,
        password: editPassword.trim() || undefined,
      });

      toast.success(
        editPassword.trim()
          ? 'Personel bilgileri ve şifresi başarıyla güncellendi.'
          : 'Personel bilgileri güncellendi.'
      );
      setEditingUser(null);
      setEditPassword('');
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Güncelleme yapılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`"${user.fullName}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await userApi.delete(user.id);
      toast.success(`${user.fullName} başarıyla silindi.`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kullanıcı silinemedi.');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditDepartment(user.department);
    setEditRole(user.role);
    setEditPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık Barı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Personel ve Kullanıcı Yönetimi</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sistem yetkilendirmesi (RBAC) ve personel zimmet kütüğü
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadUsers}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Listeyi Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yeni Personel Ekle</span>
          </button>
        </div>
      </div>

      {/* Kullanıcılar Tablosu */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-4 pl-6">Ad Soyad & E-posta</th>
                <th className="py-4">Departman / Birim</th>
                <th className="py-4">Rol & Yetki</th>
                <th className="py-4">Zimmetli Cihaz</th>
                <th className="py-4">Kayıt Tarihi</th>
                <th className="py-4 pr-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Personel listesi yükleniyor...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Sistemde kayıtlı kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* İsim ve Avatar */}
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Departman */}
                    <td className="py-4 text-slate-300 font-medium">
                      {u.department}
                    </td>

                    {/* Rol */}
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role === 'ADMIN' ? 'YÖNETİCİ' : 'PERSONEL'}
                      </span>
                    </td>

                    {/* Zimmet Sayısı */}
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold">
                        <Laptop className="w-3 h-3 text-cyan-400" />
                        <span>{u._count?.assignedAssets || 0} Cihaz</span>
                      </span>
                    </td>

                    {/* Kayıt Tarihi */}
                    <td className="py-4 text-slate-400">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* İşlemler */}
                    <td className="py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                          title="Düzenle ve Şifre Yönet"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-800/40 transition-colors"
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Personel Ekle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Yeni Personel Kaydı</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  AD SOYAD *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ayşe Demir"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  KURUMSAL E-POSTA *
                </label>
                <input
                  type="email"
                  placeholder="ayse.demir@gop.edu.tr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  İLK ŞİFRE *
                </label>
                <input
                  type="password"
                  placeholder="En az 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  DEPARTMAN / BİRİM *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Bilgi İşlem Daire Başkanlığı"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  ROL VE YETKİ DERECESİ
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STAFF">Personel (Standart Kullanıcı)</option>
                  <option value="ADMIN">Yönetici (Admin)</option>
                </select>
              </div>

              <div className="p-5 border-t border-slate-800 -mx-6 -mb-6 mt-6 bg-slate-950/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Personeli Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personel Düzenle & Şifre Yönet Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Personel & Şifre Yönetimi</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  AD SOYAD
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  DEPARTMAN / BİRİM
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  ROL VE YETKİ DERECESİ
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STAFF">Personel (Standart)</option>
                  <option value="ADMIN">Yönetici (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>ŞİFRE YÖNETİMİ / SIFIRLAMA</span>
                  </span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">(isteğe bağlı)</span>
                </label>
                <input
                  type="password"
                  placeholder="Yeni şifre (Değiştirmek istemiyorsanız boş bırakın)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Yönetici olarak bu personelin şifresini doğrudan buradan sıfırlayabilirsiniz (en az 6 karakter).
                </p>
              </div>

              <div className="p-5 border-t border-slate-800 -mx-6 -mb-6 mt-6 bg-slate-950/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

