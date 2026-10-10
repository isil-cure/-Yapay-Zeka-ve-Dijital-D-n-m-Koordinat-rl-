import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      <div>
        Toplam <strong style={{ color: '#f8fafc' }}>{totalItems}</strong> kayıttan{' '}
        <span style={{ color: '#93c5fd' }}>{startItem}-{endItem}</span> arası gösteriliyor
      </div>

      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Önceki Sayfa"
        >
          <ChevronLeft size={16} />
          <span>Önceki</span>
        </button>

        <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
          {currentPage} / {totalPages || 1}
        </span>

        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Sonraki Sayfa"
        >
          <span>Sonraki</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
