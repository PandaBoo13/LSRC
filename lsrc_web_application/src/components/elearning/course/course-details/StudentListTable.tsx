// src/components/course-detail/students/StudentListTable.tsx
import {
  FaUserGraduate,
  FaBookReader,
  FaCalendarAlt,
} from 'react-icons/fa';
import type { ProgressResponse } from '../../../../service/progress/progress.types';

// ==================== TYPES ====================

export interface StudentListTableProps {
  /** Danh sách học viên cần hiển thị. */
  students: ProgressResponse[];

  /**
   * Callback khi user double-click vào tên học viên.
   * Dùng để điều hướng sang trang progress chi tiết.
   */
  onStudentDoubleClick?: (student: ProgressResponse) => void;

  /**
   * Callback khi user click 1 lần vào row (không bắt buộc).
   * Nếu không truyền → chỉ dùng double-click.
   */
  onStudentClick?: (student: ProgressResponse) => void;

  /** Message hiển thị khi không có học viên nào. */
  emptyMessage?: string;
  emptyDescription?: string;
}

// ==================== HELPER: Status badge info ====================

interface StatusInfo {
  label: string;
  className: string;
  dotColor: string;
}

function getStatusInfo(status?: string): StatusInfo {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Đã hoàn thành',
        className: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
        dotColor: 'bg-emerald-500',
      };
    case 'IN_PROGRESS':
      return {
        label: 'Đang học',
        className: 'bg-[#49BBBD]/10 text-[#49BBBD] border border-[#49BBBD]/20',
        dotColor: 'bg-[#49BBBD]',
      };
    case 'NOT_STARTED':
    default:
      return {
        label: 'Chưa bắt đầu',
        className: 'bg-amber-50 text-amber-600 border border-amber-200/60',
        dotColor: 'bg-amber-500',
      };
  }
}

// ==================== HELPER: Safe progress value ====================

function safeProgress(value: unknown): number {
  const num = Number(value) || 0;
  return Math.min(100, Math.max(0, num));
}

// ==================== COMPONENT ====================

export function StudentListTable({
  students,
  onStudentDoubleClick,
  onStudentClick,
  emptyMessage = 'Chưa có học viên nào tham gia',
  emptyDescription = 'Khi học viên đăng ký khóa học này, tiến độ chi tiết của họ sẽ được hiển thị tại đây.',
}: StudentListTableProps) {

  // ==================== HANDLERS ====================

  /**
   * Xử lý double-click vào tên học viên.
   * Ngăn chặn selection text khi double-click.
   */
  const handleNameDoubleClick = (
    e: React.MouseEvent,
    student: ProgressResponse
  ) => {
    e.stopPropagation();
    window.getSelection()?.removeAllRanges(); // Clear selection do double-click
    onStudentDoubleClick?.(student);
  };

  /**
   * Xử lý single-click vào row (nếu có callback).
   */
  const handleRowClick = (student: ProgressResponse) => {
    onStudentClick?.(student);
  };

  // ==================== EMPTY STATE ====================

  if (students.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#49BBBD]/10 text-[#49BBBD] mx-auto flex items-center justify-center text-2xl mb-3 shadow-sm">
          <FaUserGraduate />
        </div>
        <p className="text-sm font-bold text-[#2F327D]">{emptyMessage}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <>
      {/* ==================== DESKTOP — TABLE ==================== */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th className="p-4">Học viên</th>
              <th className="p-4">Tiến độ</th>
              <th className="p-4">Mục hoàn thành</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-right">Truy cập cuối</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((sp, index) => {
              const statusInfo = getStatusInfo(sp.status);
              const progressVal = safeProgress(sp.progressPercentage);
              const completedItems = sp.completedItems || 0;
              const totalItems = sp.totalItems || 0;

              return (
                <tr
                  key={sp.accountId || index}
                  onClick={() => handleRowClick(sp)}
                  className={`hover:bg-slate-50/50 transition duration-150 ${
                    onStudentClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Cột Học viên — double-click để mở progress */}
                  <td className="p-4 font-bold text-[#2F327D]">
                    <div
                      className="flex items-center gap-3 select-none"
                      onDoubleClick={(e) => handleNameDoubleClick(e, sp)}
                      title={
                        onStudentDoubleClick
                          ? 'Nhấp đúp để xem chi tiết tiến độ'
                          : undefined
                      }
                    >
                      <div className="w-9 h-9 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center font-extrabold text-xs shrink-0 uppercase border border-[#49BBBD]/20">
                        {sp.username ? sp.username.charAt(0) : 'U'}
                      </div>
                      <span className="line-clamp-1">
                        {sp.username || 'Học viên'}
                      </span>
                    </div>
                  </td>

                  {/* Cột Tiến độ */}
                  <td className="p-4">
                    <div className="flex items-center gap-3 max-w-[180px]">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#49BBBD] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 min-w-[36px] text-right">
                        {progressVal}%
                      </span>
                    </div>
                  </td>

                  {/* Cột Mục hoàn thành */}
                  <td className="p-4 text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <FaBookReader className="text-xs text-[#49BBBD]" />
                      {completedItems}/{totalItems} mục
                    </span>
                  </td>

                  {/* Cột Trạng thái */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusInfo.className}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}
                      />
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Cột Truy cập cuối */}
                  <td className="p-4 text-right text-slate-400 font-medium text-xs">
                    {sp.lastAccessedAt
                      ? new Date(sp.lastAccessedAt).toLocaleDateString('vi-VN')
                      : 'Chưa truy cập'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==================== MOBILE — CARDS ==================== */}
      <div className="block md:hidden space-y-3">
        {students.map((sp, index) => {
          const statusInfo = getStatusInfo(sp.status);
          const progressVal = safeProgress(sp.progressPercentage);
          const completedItems = sp.completedItems || 0;
          const totalItems = sp.totalItems || 0;

          return (
            <div
              key={sp.accountId || index}
              onClick={() => handleRowClick(sp)}
              className={`p-4 rounded-2xl border border-slate-100 bg-slate-50/40 space-y-3 ${
                onStudentClick ? 'cursor-pointer' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex items-center gap-2.5 min-w-0 select-none"
                  onDoubleClick={(e) => handleNameDoubleClick(e, sp)}
                  title={
                    onStudentDoubleClick
                      ? 'Nhấp đúp để xem chi tiết tiến độ'
                      : undefined
                  }
                >
                  <div className="w-8 h-8 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-[#49BBBD]/20">
                    {sp.username ? sp.username.charAt(0) : 'U'}
                  </div>
                  <h4 className="text-xs font-bold text-[#2F327D] truncate">
                    {sp.username || 'Học viên'}
                  </h4>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusInfo.className}`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${statusInfo.dotColor}`}
                  />
                  {statusInfo.label}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Tiến độ học tập
                  </span>
                  <span className="font-bold text-[#49BBBD]">
                    {progressVal}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#49BBBD] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/60 text-[11px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <FaBookReader className="text-[9px] text-[#49BBBD]" /> Mục
                    hoàn thành
                  </span>
                  <span className="font-bold text-slate-700">
                    {completedItems}/{totalItems}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <FaCalendarAlt className="text-[9px]" /> Truy cập
                  </span>
                  <span className="font-bold text-slate-700">
                    {sp.lastAccessedAt
                      ? new Date(sp.lastAccessedAt).toLocaleDateString('vi-VN')
                      : 'Chưa truy cập'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default StudentListTable;