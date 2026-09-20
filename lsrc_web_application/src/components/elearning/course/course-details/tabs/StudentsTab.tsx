// src/components/course-detail/tabs/StudentsTab.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

import { StudentListTable } from '../StudentListTable';
import { getStudentsProgressByCourse } from '../../../../../service/progress/progressService';
import type { ProgressResponse } from '../../../../../service/progress/progress.types';

interface StudentsTabProps {
  courseId: number;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({ courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect admin route để build URL chính xác
  const isAdmin = location.pathname.startsWith('/admin');

  const [studentsProgress, setStudentsProgress] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ==================== FETCH ====================
  const fetchStudents = useCallback(async () => {
    if (!courseId || isNaN(Number(courseId))) return;
    setLoading(true);
    try {
      const data = await getStudentsProgressByCourse(courseId);
      setStudentsProgress(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách học viên:', err);
      setStudentsProgress([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ==================== HANDLER ====================
  /**
   * Double-click vào tên học viên → chuyển sang trang progress chi tiết.
   *
   * FIXED: bỏ `/progress` — khớp với route trong AppRouter.tsx:
   *  - Instructor: /instructor/courses/:courseId/students/:studentId
   *  - Admin:      /admin/courses/:courseId/students/:studentId
   */
  const handleStudentDoubleClick = useCallback(
    (student: ProgressResponse) => {
      if (!student.accountId) return;

      const basePath = isAdmin ? '/admin/courses' : '/instructor/courses';
      const targetUrl = `${basePath}/${courseId}/students/${student.accountId}`;

      navigate(targetUrl);
    },
    [courseId, isAdmin, navigate]
  );

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-[#49BBBD]" size={28} />
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="w-full space-y-5 min-w-0">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[#2F327D] truncate flex items-center gap-2">
            Danh sách Học viên
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#49BBBD]/10 text-[#49BBBD] font-extrabold">
              {studentsProgress.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi tiến độ học tập của từng học viên.
            {studentsProgress.length > 0 && (
              <span className="ml-1 text-[#49BBBD] font-medium">
                Nhấp đúp vào tên để xem chi tiết.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <StudentListTable
          students={studentsProgress}
          onStudentDoubleClick={handleStudentDoubleClick}
        />
      </div>
    </div>
  );
};

export default StudentsTab;