// src/components/elearning/audit/AuditLogToolbar.tsx
import React from 'react';
import { FaFilter, FaTimes, FaTrash } from 'react-icons/fa';

type Props = {
  showFilters: boolean;
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  onCleanOldLogs: () => void;
};

export const AuditLogToolbar: React.FC<Props> = ({
  showFilters,
  hasActiveFilters,
  onToggleFilters,
  onClearFilters,
  onCleanOldLogs,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFilters}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            showFilters || hasActiveFilters
              ? 'bg-[#49BBBD]/10 text-[#49BBBD] ring-1 ring-[#49BBBD]/30'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FaFilter size={11} />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#49BBBD]" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
          >
            <FaTimes size={10} /> Xóa bộ lọc
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onCleanOldLogs}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition border border-rose-200 cursor-pointer"
      >
        <FaTrash size={11} /> Dọn log (&gt;90 ngày)
      </button>
    </div>
  );
};