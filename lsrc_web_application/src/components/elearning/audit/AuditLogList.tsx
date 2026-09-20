// src/components/elearning/audit/AuditLogList.tsx
import React, { useState } from 'react';
import { Panel } from '../../../components/elearning/ui/Panel';
import { FaSpinner, FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AuditLogItem } from './AuditLogItem';
import { AuditLogDetailModal } from './AuditLogDetailModal';
import type { AuditLog } from '../../../types/auditLog.types';

type Props = {
  logs: AuditLog[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  getActionConfig: (action: string) => { label: string; icon: React.ReactNode; color: string };
  getEntityConfig: (entityType: string) => { label: string; icon: React.ReactNode; color: string };
  getSeverity: (action: string) => { label: string; icon: React.FC<{ size?: number }>; color: string };
  formatDate: (dateStr: string) => string;
  onPageChange: (page: number) => void;
};

export const AuditLogList: React.FC<Props> = ({
  logs,
  loading,
  page,
  totalPages,
  totalElements,
  pageSize,
  getActionConfig,
  getEntityConfig,
  getSeverity,
  formatDate,
  onPageChange,
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <FaSpinner className="animate-spin h-8 w-8 text-[#49BBBD]" />
        <span className="text-xs font-bold text-slate-400">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-12 text-center">
        <FaInfoCircle className="mx-auto text-slate-300 mb-3" size={40} />
        <p className="text-sm font-semibold text-slate-500">Không tìm thấy bản ghi nào.</p>
        <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc kiểm tra lại sau.</p>
      </div>
    );
  }

  return (
    <>
      <Panel className="overflow-hidden">
        <div className="space-y-2">
          {logs.map((log) => (
            <AuditLogItem
              key={log.id}
              log={log}
              actionConfig={getActionConfig(log.action)}
              entityConfig={getEntityConfig(log.entityType)}
              severityConfig={getSeverity(log.action)}
              formatDate={formatDate}
              onClick={setSelectedLog}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Hiển thị {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalElements)} / {totalElements} bản ghi
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-600"
              >
                <FaChevronLeft size={11} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + Math.max(0, Math.min(page - 2, totalPages - 5));
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      pageNum === page
                        ? 'bg-[#49BBBD] hover:bg-[#3da8aa] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-600"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        )}
      </Panel>

      {/* Modal chi tiết */}
      <AuditLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
};