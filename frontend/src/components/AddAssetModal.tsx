import React, { useState, useEffect } from 'react';
import { User, AssetStatus } from '../types';
import { assetApi, userApi } from '../services/api';
import { X, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AssetStatus>('IN_STOCK');
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const res = await userApi.getAll();
      if (res.success) setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !model || !serialNumber || !purchaseDate) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await assetApi.create({
        name,
        brand,
        model,
        serialNumber,
        assetTag: assetTag.trim() || undefined,
        purchaseDate,
        status,
        assignedToUserId: assignedToUserId || null,
        notes: notes.trim() || undefined,
      });

      toast.success('Yeni demirbaş ve QR kodu başarıyla oluşturuldu!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Demirbaş kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Başlık */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Yeni Demirbaş Kaydı</h3>
              <p className="text-xs text-slate-400">QR kod ve demirbaş kimliği otomatik üretilir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Alanı */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                CİHAZ ADI / TANIMI *
              </label>
              <input
                type="text"
                placeholder="Örn: MacBook Pro 16 M3 Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                ÖZEL ETİKET KODU (İSTEĞE BAĞLI)
              </label>
              <input
                type="text"
                placeholder="Boş bırakılırsa örn: TOGU-2026-009 üretilir"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                MARKA *
              </label>
              <input
                type="text"
                placeholder="Örn: Apple, Dell, Lenovo, Cisco"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                MODEL *
              </label>
              <input
                type="text"
                placeholder="Örn: ThinkPad P16 Gen 2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                SERİ NUMARASI (S/N) *
              </label>
              <input
                type="text"
                placeholder="Örn: AP-MBP16-99120"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                SATIN ALMA TARİHİ *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                İLK DURUM
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="IN_STOCK">Depoda / Boşta (IN_STOCK)</option>
                <option value="ACTIVE">Aktif Zimmette (ACTIVE)</option>
                <option value="IN_REPAIR">Arızalı / Bakımda (IN_REPAIR)</option>
                <option value="SCRAPPED">Hurda (SCRAPPED)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                İLK ZİMMET PERSONELİ (İSTEĞE BAĞLI)
              </label>
              <select
                value={assignedToUserId}
                onChange={(e) => {
                  setAssignedToUserId(e.target.value);
                  if (e.target.value) setStatus('ACTIVE');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Zimmetleme (Depoda Tut) --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              ENVANTER NOTLARI
            </label>
            <textarea
              placeholder="Fatura no, garanti şartları veya kullanım amacı..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500 resize-none h-20"
            />
          </div>

          <div className="p-5 border-t border-slate-800 -mx-6 -mb-6 mt-6 bg-slate-950/60 flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{loading ? 'Kaydediliyor...' : 'Demirbaşı Kaydet & QR Üret'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
