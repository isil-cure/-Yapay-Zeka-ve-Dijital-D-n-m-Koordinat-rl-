import React, { useState, useEffect } from 'react';
import { Asset, User } from '../types';
import { userApi, assetApi } from '../services/api';
import { X, UserCheck, ArrowDownLeft, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AssignModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({ asset, onClose, onSuccess }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(true);

  const isAssigned = asset?.status === 'ACTIVE' && !!asset.assignedToUserId;

  useEffect(() => {
    if (!isAssigned) {
      loadUsers();
    }
  }, [isAssigned]);

  const loadUsers = async () => {
    try {
      setFetchingUsers(true);
      const res = await userApi.getAll();
      if (res.success) {
        setUsers(res.data);
        if (res.data.length > 0) {
          setSelectedUserId(res.data[0].id);
        }
      }
    } catch (err: any) {
      toast.error('Personel listesi yüklenemedi.');
    } finally {
      setFetchingUsers(false);
    }
  };

  if (!asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAssigned) {
        // İade işlemi
        await assetApi.return(asset.id, notes);
        toast.success(`"${asset.name}" başarıyla depoya iade alındı.`);
      } else {
        // Atama işlemi
        if (!selectedUserId) {
          toast.error('Lütfen zimmetlenecek personeli seçiniz.');
          setLoading(false);
          return;
        }
        await assetApi.assign(asset.id, selectedUserId, notes);
        toast.success(`"${asset.name}" seçilen personele zimmetlendi.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Başlık */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
              isAssigned ? 'bg-amber-600/20 text-amber-400' : 'bg-emerald-600/20 text-emerald-400'
            }`}>
              {isAssigned ? <ArrowDownLeft className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAssigned ? 'Zimmet İadesi (Depoya Çek)' : 'Demirbaş Zimmetleme'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{asset.assetTag} - {asset.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form İçeriği */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {isAssigned ? (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200">
                <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Zimmetli Personel Bilgisi</span>
                </div>
                <p className="text-xs text-slate-300">
                  Bu cihaz şu anda <strong className="text-white">{asset.assignedToUser?.fullName}</strong> ({asset.assignedToUser?.department}) personeline tahsislidir.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  İade onaylandığında cihaz durumu <span className="text-emerald-400 font-bold">DEPODA (IN_STOCK)</span> olarak güncellenecek ve zimmetten düşürülecektir.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  ZİMMETLENECEK PERSONELİ SEÇİN *
                </label>
                {fetchingUsers ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-800/60 rounded-xl">
                    Personel listesi yükleniyor...
                  </div>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} — {u.department} ({u.role === 'ADMIN' ? 'Yönetici' : 'Personel'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                ZİMMET / İADE AÇIKLAMASI (OPSİYONEL)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAssigned ? 'Cihaz eksiksiz ve çalışır durumda teslim alındı...' : 'AR-GE projesi kapsamında çalışma masasına tahsis edildi...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500 transition-colors resize-none h-24"
              />
            </div>
          </div>

          {/* Modal Butonları */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                isAssigned
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>İşleniyor...</span>
              ) : isAssigned ? (
                <>
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Depoya İade Al</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Personele Zimmetle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
