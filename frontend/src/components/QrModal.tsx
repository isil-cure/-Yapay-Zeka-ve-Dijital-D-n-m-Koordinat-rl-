import React from 'react';
import { Asset } from '../types';
import { X, Printer, Download, QrCode as QrIcon, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface QrModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!asset.qrCode) {
      toast.error('QR kod verisi bulunamadı.');
      return;
    }
    const link = document.createElement('a');
    link.href = asset.qrCode;
    link.download = `${asset.assetTag}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${asset.assetTag} QR kodu başarıyla indirildi.`);
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(asset.assetTag);
    toast.success('Etiket kodu panoya kopyalandı.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Başlığı */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Demirbaş QR Etiketi</h3>
              <p className="text-xs text-slate-400">Tokat Gaziosmanpaşa Üniversitesi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Yazdırılabilir Kart Alanı */}
        <div className="p-6">
          <div className="printable-area p-6 bg-white rounded-2xl shadow-inner text-slate-900 text-center border-2 border-slate-200">
            <div className="border-b border-slate-200 pb-3 mb-3">
              <p className="text-[11px] font-black tracking-widest text-blue-900 uppercase">
                TOKAT GAZİOSMANPAŞA ÜNİVERSİTESİ
              </p>
              <p className="text-[10px] text-slate-600 font-semibold">
                Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
              </p>
            </div>

            <div className="flex justify-center my-3">
              <img
                src={asset.qrCode}
                alt={asset.assetTag}
                className="w-48 h-48 object-contain rounded-lg border border-slate-200 p-1"
              />
            </div>

            <div className="mt-2">
              <div className="inline-block bg-blue-100 text-blue-950 px-3 py-1 rounded-full font-mono font-black text-sm tracking-wider">
                {asset.assetTag}
              </div>
              <p className="font-bold text-sm text-slate-800 mt-2 truncate">{asset.name}</p>
              <p className="text-xs text-slate-600">
                {asset.brand} - {asset.model}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">S/N: {asset.serialNumber}</p>
            </div>
          </div>
        </div>

        {/* Eylem Butonları */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyTag}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Kodu Kopyala</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>İndir (PNG)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
