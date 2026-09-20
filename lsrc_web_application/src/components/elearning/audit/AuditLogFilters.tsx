// src/components/elearning/audit/AuditLogFilters.tsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import type { AuditLogSearchRequest } from '../../../types/auditLog.types';

type Props = {
  filters: AuditLogSearchRequest;
  entityTypeOptions: Record<string, { label: string }>;
  actionOptions: Record<string, { label: string }>;
  onFilterChange: (key: keyof AuditLogSearchRequest, value: string | undefined) => void;
  onApply: () => void;
};

export const AuditLogFilters: React.FC<Props> = ({
  filters,
  entityTypeOptions,
  actionOptions,
  onFilterChange,
  onApply,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Entity Type Filter */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Loại đối tượng
          </label>
          <select
            value={filters.entityType || ''}
            onChange={e => onFilterChange('entityType', e.target.value || undefined)}
            className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
          >
            <option value="">Tất cả đối tượng</option>
            {Object.entries(entityTypeOptions).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Hành động
          </label>
          <select
            value={filters.action || ''}
            onChange={e => onFilterChange('action', e.target.value || undefined)}
            className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
          >
            <option value="">Tất cả hành động</option>
            {Object.entries(actionOptions).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Keyword Search */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Từ khóa
          </label>
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={e => onFilterChange('keyword', e.target.value || undefined)}
            placeholder="Tìm trong mô tả..."
            className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition placeholder:text-slate-400"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Từ ngày
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={e => onFilterChange('startDate', e.target.value || undefined)}
            className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition text-slate-700"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            Đến ngày
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => onFilterChange('endDate', e.target.value || undefined)}
            className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition text-slate-700"
          />
        </div>

        {/* Apply Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onApply}
            className="w-full h-9 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition flex items-center justify-center gap-1.5 shadow-xs shadow-indigo-500/20 cursor-pointer"
          >
            <FaSearch size={11} /> Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};