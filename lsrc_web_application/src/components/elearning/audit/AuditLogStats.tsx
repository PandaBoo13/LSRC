// src/components/elearning/audit/AuditLogStats.tsx
import React from 'react';
import { MetricCard } from '../../../components/elearning';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

type Props = {
  todayCount: number;
  deleteCount: number;
  criticalCount: number;
  totalElements: number;
};

export const AuditLogStats: React.FC<Props> = ({ todayCount, deleteCount, criticalCount, totalElements }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        label="Sự kiện hôm nay"
        value={String(todayCount)}
        note={`Tổng: ${totalElements} bản ghi`}
        icon={<FaShieldAlt />}
        accent="bg-[#49BBBD]/10 text-[#49BBBD]"
      />
      <MetricCard
        label="Cảnh báo"
        value={String(deleteCount)}
        note="Hành động xóa"
        icon={<FaExclamationTriangle />}
        accent="bg-amber-50 text-amber-600"
      />
      <MetricCard
        label="Nghiêm trọng"
        value={String(criticalCount)}
        note="Xóa, Từ chối, Lưu trữ"
        icon={<FaShieldAlt />}
        accent="bg-rose-50 text-rose-600"
      />
    </div>
  );
};