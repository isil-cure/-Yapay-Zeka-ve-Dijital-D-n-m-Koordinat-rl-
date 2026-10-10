import React from 'react';
import { Package, CheckCircle2, Warehouse, AlertTriangle, Trash2 } from 'lucide-react';

interface StatCardsProps {
  metrics: {
    totalAssets: number;
    activeAssigned: number;
    inStock: number;
    inRepair: number;
    scrapped?: number;
  };
  onFilterClick?: (status: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ metrics, onFilterClick }) => {
  const cards = [
    {
      id: 'TOTAL',
      label: 'TOPLAM DEMİRBAŞ',
      value: metrics.totalAssets,
      subtext: 'Kayıtlı envanter varlığı',
      icon: Package,
      gradient: 'from-blue-600/20 to-blue-500/10',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-600/20',
      statusParam: '',
    },
    {
      id: 'ACTIVE',
      label: 'AKTİF ZİMMETTE',
      value: metrics.activeAssigned,
      subtext: 'Personel kullanımında',
      icon: CheckCircle2,
      gradient: 'from-emerald-600/20 to-emerald-500/10',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-600/20',
      statusParam: 'ACTIVE',
    },
    {
      id: 'IN_STOCK',
      label: 'DEPODA / BOŞTA',
      value: metrics.inStock,
      subtext: 'Zimmete tahsise hazır',
      icon: Warehouse,
      gradient: 'from-cyan-600/20 to-cyan-500/10',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-600/20',
      statusParam: 'IN_STOCK',
    },
    {
      id: 'IN_REPAIR',
      label: 'ARIZALI / BAKIMDA',
      value: metrics.inRepair,
      subtext: 'Yetkili serviste / onarımda',
      icon: AlertTriangle,
      gradient: 'from-amber-600/20 to-amber-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-600/20',
      statusParam: 'IN_REPAIR',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick && onFilterClick(card.statusParam)}
            className={`relative p-5 rounded-2xl bg-slate-900/90 border ${card.border} bg-gradient-to-br ${card.gradient} shadow-lg backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
