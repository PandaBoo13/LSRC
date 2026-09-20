// src/components/elearning/audit/AuditLogDetailModal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaArrowRight, FaPlus, FaMinus, FaExternalLinkAlt } from 'react-icons/fa';
import type { AuditLog } from '../../../types/auditLog.types';
import { getEntityLabel, getEntityLink } from '../../../utils/auditNavigation';

type Props = {
  log: AuditLog | null;
  onClose: () => void;
};

// Helper parse JSON an toàn
function parseJSON(str?: string): Record<string, any> {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

export const AuditLogDetailModal: React.FC<Props> = ({ log, onClose }) => {
  if (!log) return null;

  // Parse oldValue và newValue
  const oldData = parseJSON(log.oldValue);
  const newData = parseJSON(log.newValue);

  // Tìm các field thay đổi
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const changes: { key: string; oldVal: any; newVal: any; changed: boolean }[] = [];

  allKeys.forEach(key => {
    const oldVal = oldData[key];
    const newVal = newData[key];
    const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
    changes.push({ key, oldVal, newVal, changed });
  });

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic font-normal">(trống)</span>;
    if (typeof val === 'boolean') return val ? '✅ Có' : '❌ Không';
    return String(val);
  };

  const FIELD_LABELS: Record<string, string> = {
    title: 'Tiêu đề',
    description: 'Mô tả',
    level: 'Cấp độ',
    duration: 'Thời lượng',
    price: 'Giá',
    oldPrice: 'Giá gốc',
    isFree: 'Miễn phí',
    hasCertificate: 'Chứng chỉ',
    accessPeriod: 'Thời gian truy cập',
    language: 'Ngôn ngữ',
    courseType: 'Loại khóa học',
    status: 'Trạng thái',
  };

  // Lấy link điều hướng theo entity
  const entityLink = getEntityLink(log.entityType, log.entityId);
  const entityLabel = getEntityLabel(log.entityType);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="text-base font-extrabold text-[#2F327D]">Chi tiết thay đổi</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{log.summary}</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-[#2F327D] hover:bg-slate-200/60 transition cursor-pointer shrink-0"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {log.action === 'CREATE' ? (
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Dữ liệu mới được khởi tạo
              </div>
              <div className="space-y-2 pt-1">
                {changes.map(c => (
                  <div key={c.key} className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-medium text-slate-600">{FIELD_LABELS[c.key] || c.key}</span>
                    <span className="text-xs font-bold text-[#2F327D]">{formatValue(c.newVal)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : log.action === 'DELETE' ? (
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Dữ liệu đã bị xóa
              </div>
              <div className="space-y-2 pt-1">
                {changes.map(c => (
                  <div key={c.key} className="flex justify-between items-center py-2.5 px-3.5 rounded-xl bg-rose-50/30 border border-rose-100">
                    <span className="text-xs font-medium text-slate-600">{FIELD_LABELS[c.key] || c.key}</span>
                    <span className="text-xs font-bold text-rose-600/80 line-through">{formatValue(c.oldVal)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#49BBBD]/10 border border-[#49BBBD]/30 text-[#49BBBD] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#49BBBD]" />
                Các trường thông tin đã cập nhật
              </div>
              <div className="space-y-2 pt-1">
                {changes.filter(c => c.changed).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Không phát hiện thay đổi cụ thể.</p>
                ) : (
                  changes.filter(c => c.changed).map(c => (
                    <div key={c.key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 transition hover:border-[#49BBBD]/50">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                        {FIELD_LABELS[c.key] || c.key}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 line-through">
                          <FaMinus size={8} />
                          {formatValue(c.oldVal)}
                        </span>
                        <FaArrowRight size={10} className="text-slate-400 shrink-0" />
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <FaPlus size={8} />
                          {formatValue(c.newVal)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div>
            {entityLink && (
              <Link
                to={entityLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition active:scale-95"
              >
                <FaExternalLinkAlt size={10} />
                Xem {entityLabel}
                {log.entityId ? ` #${log.entityId}` : ''}
              </Link>
            )}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2 rounded-xl bg-[#49BBBD] hover:bg-[#3da8aa] text-white text-xs font-bold active:scale-95 transition shadow-xs cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};