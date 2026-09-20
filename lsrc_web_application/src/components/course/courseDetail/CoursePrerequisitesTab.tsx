// src/pages/elearning/StudentPages/components/CourseDetail/CoursePrerequisitesTab.tsx
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import type { PrerequisiteInfo } from '../../../types/course.types';

interface CoursePrerequisitesTabProps {
  prerequisite?: PrerequisiteInfo; // ✅ Đổi prerequisites (list) → prerequisite (1-1)
}

export function CoursePrerequisitesTab({ prerequisite }: CoursePrerequisitesTabProps) {
  if (!prerequisite) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Prerequisites</h2>
        <p className="text-xs text-slate-400">Khóa học này không yêu cầu khóa học tiên quyết.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Prerequisites</h2>
      <p className="text-xs text-slate-400 mb-4">Khóa học bạn cần hoàn thành trước</p>
      <div className="space-y-2">
        <Link
          to={`/courses/${prerequisite.slug}`}
          className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5 hover:border-[#49BBBD]/50 hover:bg-cyan-50/30 transition group"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
            {prerequisite.isRequired ? '!' : '?'}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-[#49BBBD] transition">
              {prerequisite.title}
            </p>
            <p className="text-xs text-slate-400">
              {prerequisite.isRequired ? 'Required' : 'Recommended'}
            </p>
          </div>
          <FaChevronRight size={12} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}