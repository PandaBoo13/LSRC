// ============================================
// CourseManagementCard.tsx - FIXED (Có Background)
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaBook, 
  FaUsers, 
  FaEye, 
  FaClock, 
  FaQuestionCircle, 
  FaVideo, 
  FaGraduationCap,
  FaChartBar,
  FaDesktop
} from 'react-icons/fa';
import type { Course } from '../../../types/course.types';
import { getImageUrl, getImageDimensions, getImageClass, getBackgroundStyle, type ImageDimensions } from '../../../utils/imageHelper';

type CourseManagementCardProps = {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onStatusChange?: (course: Course, status: string) => void;
  isAdmin?: boolean;
};

export default function CourseManagementCard({
  course,
  onEdit,
  onDelete,
  onStatusChange,
  isAdmin = false,
}: CourseManagementCardProps) {
  const basePath = isAdmin ? '/admin' : '/instructor';
  const detailPath = `${basePath}/courses/${course.id}`;

  // ✅ Kiểm tra kích thước ảnh
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  
  const thumbnail =
    getImageUrl(course.thumbnailUrl) ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';

  // ✅ Lấy background style
  const bgStyle = getBackgroundStyle(course.backgroundType, course.backgroundThumbnail);

  useEffect(() => {
    if (thumbnail) {
      getImageDimensions(thumbnail)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [thumbnail]);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-5 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div>
        {/* Thumbnail & Badges Header - ✅ THÊM BACKGROUND STYLE */}
        <div 
          className="relative mb-2.5 sm:mb-4 overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/10] bg-slate-100"
          style={bgStyle}
        >
          <Link to={detailPath} className="block w-full h-full relative z-10">
            {course.thumbnailUrl ? (
              <img
                src={thumbnail}
                alt={course.title}
                className={`${getImageClass(imageDimensions?.orientation)} transition-transform duration-300 group-hover:scale-105`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';
                }}
              />
            ) : (
              // ✅ Nếu không có thumbnail, hiển thị title trên background
              <div className="w-full h-full flex items-center justify-center p-4">
                <span className="text-white font-bold text-sm text-center line-clamp-3 drop-shadow-lg">
                  {course.title}
                </span>
              </div>
            )}
          </Link>
          {/* Status & Type Overlay Badges */}
          <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1.5 flex-wrap pointer-events-none z-20">
            <CourseStatusBadge status={course.status} />
            <CourseTypeBadge courseType={course.courseType} />
          </div>
        </div>

        {/* Course Title */}
        <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-bold text-[#2F327D] line-clamp-2 leading-snug transition-colors group-hover:text-[#49BBBD]">
          <Link to={detailPath}>
            {course.title}
          </Link>
        </h3>

        {/* Stats Row */}
        <div className="mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-medium text-slate-400 flex-wrap">
          <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
            <FaBook className="text-[#49BBBD]" size={10} />
            <strong className="text-slate-700">{course.totalLessons || 0}</strong> Lessons
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
            <FaUsers className="text-[#49BBBD]" size={10} />
            <strong className="text-slate-700">{course.totalStudents || 0}</strong> Students
          </span>
          {course.duration && (
            <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
              <FaClock className="text-slate-400" size={10} />
              {course.duration}
            </span>
          )}
        </div>
      </div>

      {/* Management Actions Section */}
      <div className="pt-2.5 sm:pt-4 border-t border-slate-100 space-y-2 sm:space-y-3">
        {/* Quick Management Links */}
        <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
          <Link
            to={detailPath}
            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50/60 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[10px] sm:text-[11px] font-bold"
            title="Xem chi tiết & Thống kê"
          >
            <FaChartBar size={11} />
            <span className="truncate max-w-full">Overview</span>
          </Link>
          <Link
            to={`${basePath}/courses/${course.id}/preview`}
            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-50/60 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-[10px] sm:text-[11px] font-bold"
            title="Xem trước khóa học"
          >
            <FaDesktop size={11} />
            <span className="truncate max-w-full">Preview</span>
          </Link>
        </div>

        {/* Primary Controls Row */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-0.5">
          {/* Status Dropdown */}
          <select
            value={course.status}
            onChange={(e) => onStatusChange?.(course, e.target.value)}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold border border-slate-200 rounded-lg sm:rounded-xl bg-white text-slate-700 hover:border-slate-300 outline-none focus:ring-2 focus:ring-[#49BBBD]/20 cursor-pointer"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Buttons Group */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <Link
              to={`/courses/${course.slug}`}
              target="_blank"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-[#49BBBD] hover:bg-slate-50 transition"
              title="View public page"
            >
              <FaEye size={12} />
            </Link>
            <button
              type="button"
              onClick={() => onEdit?.(course)}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
              title="Edit course"
            >
              <FaEdit size={12} />
            </button>
            {course.status === 'DRAFT' && (
              <button
                type="button"
                onClick={() => onDelete?.(course)}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Delete course"
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Badges Helper
function CourseStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: 'Published', className: 'bg-emerald-500 text-white shadow-xs' },
    DRAFT: { label: 'Draft', className: 'bg-amber-500 text-white shadow-xs' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-500 text-white shadow-xs' },
  };

  const config = configs[status] || configs.DRAFT;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${config.className}`}>
      {config.label}
    </span>
  );
}

function CourseTypeBadge({ courseType }: { courseType?: string }) {
  if (!courseType) return null;

  if (courseType === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-md">
        <FaVideo size={8} /> Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md">
      <FaGraduationCap size={8} /> Self-paced
    </span>
  );
}