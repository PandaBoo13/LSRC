// src/components/elearning/audit/AuditLogItem.tsx
import React from 'react';
import { FaUser, FaCalendar, FaInfoCircle } from 'react-icons/fa';
import type { AuditLog } from '../../../types/auditLog.types';

type ActionConfig = { label: string; icon: React.ReactNode; color: string };
type EntityConfig = { label: string; icon: React.ReactNode; color: string };
type SeverityConfig = { label: string; icon: React.FC<{ size?: number }>; color: string };

type Props = {
  log: AuditLog;
  actionConfig: ActionConfig;
  entityConfig: EntityConfig;
  severityConfig: SeverityConfig;
  formatDate: (dateStr: string) => string;
  onClick?: (log: AuditLog) => void;
};

export const AuditLogItem: React.FC<Props> = ({
  log,
  actionConfig,
  entityConfig,
  severityConfig,
  formatDate,
  onClick,
}) => {
  const SevIcon = severityConfig.icon;
  const hasDetail = log.oldValue || log.newValue;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#49BBBD]/40 hover:shadow-xs p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
        hasDetail ? 'cursor-pointer' : ''
      }`}
      onClick={() => hasDetail && onClick?.(log)}
    >
      {/* Left: Info */}
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${severityConfig.color}`}>
          <SevIcon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#2F327D] text-sm leading-snug truncate">
            {log.summary || `${actionConfig.label} ${entityConfig.label}`}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${entityConfig.color}`}>
              {entityConfig.icon}
              {entityConfig.label}
            </span>
            {log.entityId && (
              <span className="text-[10px] font-mono text-slate-400">#{log.entityId}</span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <FaUser size={9} className="text-slate-400" />
              <span className="font-medium text-slate-600">{log.actorName || `User #${log.actorId}`}</span>
            </span>
            {/* Nút xem chi tiết */}
            {hasDetail && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#49BBBD] font-bold hover:underline">
                <FaInfoCircle size={9} />
                Xem chi tiết
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Meta */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5">
          <FaCalendar size={10} className="text-slate-400" />
          {formatDate(log.createdAt)}
        </span>
        {log.ipAddress && (
          <span className="hidden sm:inline text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
            {log.ipAddress}
          </span>
        )}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${actionConfig.color}`}>
          {actionConfig.icon}
          {actionConfig.label}
        </span>
      </div>
    </div>
  );
};