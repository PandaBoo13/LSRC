// src/components/progress/StatusBadge.tsx
import React from 'react';
import type { StatusBadgeProps } from '../../../service/progress/progress.types';
import { getStatusLabel, getStatusIcon } from '../../../utils/progressUtils';
import { PROGRESS_STATUS } from '../../../service/progress/progress.types';

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // ✅ Đầy đủ 5 status + fallback
  const statusStyles: Record<string, string> = {
    [PROGRESS_STATUS.COMPLETED]:   'bg-emerald-100 text-emerald-800 border-emerald-300',
    [PROGRESS_STATUS.PASSED]:      'bg-emerald-100 text-emerald-800 border-emerald-300',
    [PROGRESS_STATUS.IN_PROGRESS]: 'bg-[#49BBBD]/10 text-[#49BBBD] border-[#49BBBD]/30',
    [PROGRESS_STATUS.FAILED]:      'bg-rose-100 text-rose-800 border-rose-300',
    [PROGRESS_STATUS.NOT_STARTED]: 'bg-slate-100 text-slate-600 border-slate-300',
  };

  const fallbackStyle = 'bg-slate-100 text-slate-600 border-slate-300';
  const styleClass = statusStyles[status] || fallbackStyle;

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${styleClass}
        ${className}
      `}
    >
      <span aria-hidden="true">{getStatusIcon(status)}</span>
      <span>{getStatusLabel(status)}</span>
    </span>
  );
};