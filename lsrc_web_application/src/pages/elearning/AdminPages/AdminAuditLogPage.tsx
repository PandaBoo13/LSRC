// src/pages/elearning/AdminPages/AdminAuditLogPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { adminNav } from '../../../data/elearning';
// ✅ Sửa import
import { searchAuditLogs, cleanOldAuditLogs } from '../../../service/auditLogService';
import {
  AuditLogStats,
  AuditLogToolbar,
  AuditLogFilters,
  AuditLogList,
} from '../../../components/elearning/audit';
import type { AuditLog, AuditLogSearchRequest } from '../../../types/auditLog.types';
import type { PageResponse } from '../../../types/course.types';
import {
  FaPlus, FaEdit, FaTrashAlt, FaClone, FaCheck, FaBan,
  FaArchive, FaPaperPlane, FaBook, FaQuestionCircle,
  FaLayerGroup, FaUsers, FaFolder, FaClipboardCheck, FaFileAlt,
  FaInfoCircle, FaExclamationTriangle,
} from 'react-icons/fa';

// ==================== CONSTANTS ====================
const ENTITY_TYPES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  COURSE: { label: 'Khóa học', icon: <FaBook size={12} />, color: 'bg-indigo-100 text-indigo-700' },
  LESSON: { label: 'Bài học', icon: <FaFileAlt size={12} />, color: 'bg-cyan-100 text-cyan-700' },
  CHAPTER: { label: 'Chương', icon: <FaLayerGroup size={12} />, color: 'bg-teal-100 text-teal-700' },
  EXAM: { label: 'Bài kiểm tra', icon: <FaClipboardCheck size={12} />, color: 'bg-amber-100 text-amber-700' },
  QUESTION: { label: 'Câu hỏi', icon: <FaQuestionCircle size={12} />, color: 'bg-violet-100 text-violet-700' },
  ENROLLMENT: { label: 'Đăng ký', icon: <FaUsers size={12} />, color: 'bg-emerald-100 text-emerald-700' },
  USER: { label: 'Người dùng', icon: <FaUsers size={12} />, color: 'bg-slate-100 text-slate-700' },
  CATEGORY: { label: 'Danh mục', icon: <FaFolder size={12} />, color: 'bg-orange-100 text-orange-700' },
};

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  CREATE: { label: 'Tạo mới', icon: <FaPlus size={10} />, color: 'bg-emerald-100 text-emerald-700' },
  UPDATE: { label: 'Cập nhật', icon: <FaEdit size={10} />, color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Xóa', icon: <FaTrashAlt size={10} />, color: 'bg-red-100 text-red-700' },
  PUBLISH: { label: 'Xuất bản', icon: <FaCheck size={10} />, color: 'bg-green-100 text-green-700' },
  ARCHIVE: { label: 'Lưu trữ', icon: <FaArchive size={10} />, color: 'bg-slate-100 text-slate-700' },
  CLONE: { label: 'Nhân bản', icon: <FaClone size={10} />, color: 'bg-purple-100 text-purple-700' },
  SUBMIT_REVIEW: { label: 'Gửi duyệt', icon: <FaPaperPlane size={10} />, color: 'bg-amber-100 text-amber-700' },
  APPROVE: { label: 'Phê duyệt', icon: <FaCheck size={10} />, color: 'bg-teal-100 text-teal-700' },
  REJECT: { label: 'Từ chối', icon: <FaBan size={10} />, color: 'bg-rose-100 text-rose-700' },
  UPDATE_PREREQUISITES: { label: 'Cập nhật ĐK', icon: <FaEdit size={10} />, color: 'bg-sky-100 text-sky-700' },
  REMOVE_PREREQUISITE: { label: 'Xóa ĐK', icon: <FaTrashAlt size={10} />, color: 'bg-orange-100 text-orange-700' },
};

const SEVERITY_MAP: Record<string, { label: string; icon: React.FC<{ size?: number }>; color: string }> = {
  CREATE: { label: 'Info', icon: FaInfoCircle, color: 'bg-sky-50 text-sky-700' },
  UPDATE: { label: 'Info', icon: FaInfoCircle, color: 'bg-sky-50 text-sky-700' },
  PUBLISH: { label: 'Success', icon: FaCheck, color: 'bg-emerald-50 text-emerald-700' },
  DELETE: { label: 'Warning', icon: FaExclamationTriangle, color: 'bg-amber-50 text-amber-700' },
  REJECT: { label: 'Warning', icon: FaExclamationTriangle, color: 'bg-amber-50 text-amber-700' },
  APPROVE: { label: 'Success', icon: FaCheck, color: 'bg-emerald-50 text-emerald-700' },
  CLONE: { label: 'Info', icon: FaInfoCircle, color: 'bg-sky-50 text-sky-700' },
  ARCHIVE: { label: 'Warning', icon: FaExclamationTriangle, color: 'bg-amber-50 text-amber-700' },
};

// ==================== PAGE ====================
export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuditLogSearchRequest>({});

  const pageSize = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Đổi auditLogService.search → searchAuditLogs
      const data: PageResponse<AuditLog> = await searchAuditLogs({
        ...filters,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      });
      setLogs(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleApplyFilters = () => { setPage(0); fetchLogs(); };
  const handleClearFilters = () => { setFilters({}); setPage(0); };

  const handleCleanOldLogs = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa log cũ hơn 90 ngày?')) return;
    try { 
      // ✅ Đổi auditLogService.cleanOldLogs → cleanOldAuditLogs
      await cleanOldAuditLogs(90); 
      fetchLogs(); 
    } catch (error) { 
      console.error('Failed to clean logs:', error); 
    }
  };

  const handleFilterChange = (key: keyof AuditLogSearchRequest, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  // Stats
  const todayCount = logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
  const deleteCount = logs.filter(l => l.action === 'DELETE').length;
  const criticalActions = ['DELETE', 'REJECT', 'ARCHIVE'];
  const criticalCount = logs.filter(l => criticalActions.includes(l.action)).length;

  const hasActiveFilters = !!(filters.entityType || filters.action || filters.keyword || filters.startDate || filters.endDate);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Hôm nay ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return 'Hôm qua ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionConfig = (action: string) => ACTION_CONFIG[action] || { label: action, icon: <FaInfoCircle size={10} />, color: 'bg-slate-100 text-slate-700' };
  const getEntityConfig = (type: string) => ENTITY_TYPES[type] || { label: type, icon: <FaFileAlt size={12} />, color: 'bg-slate-100 text-slate-700' };
  const getSeverity = (action: string) => SEVERITY_MAP[action] || { label: 'Info', icon: FaInfoCircle, color: 'bg-sky-50 text-sky-700' };

  return (
    <DashboardShell role="Admin" title="Lịch sử hoạt động" subtitle="Theo dõi và kiểm toán mọi hành vi trên hệ thống" navItems={adminNav}>
      <div className="w-full space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden pb-10">
        <AuditLogStats todayCount={todayCount} deleteCount={deleteCount} criticalCount={criticalCount} totalElements={totalElements} />
        
        <AuditLogToolbar
          showFilters={showFilters}
          hasActiveFilters={hasActiveFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearFilters={handleClearFilters}
          onCleanOldLogs={handleCleanOldLogs}
        />
        
        {showFilters && (
          <AuditLogFilters
            filters={filters}
            entityTypeOptions={ENTITY_TYPES}
            actionOptions={ACTION_CONFIG}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
          />
        )}

        <AuditLogList
          logs={logs}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          getActionConfig={getActionConfig}
          getEntityConfig={getEntityConfig}
          getSeverity={getSeverity}
          formatDate={formatDate}
          onPageChange={setPage}
        />
      </div>
    </DashboardShell>
  );
};