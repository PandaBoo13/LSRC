// src/components/elearning/lesson/LessonItem.tsx
import React from 'react';
import { 
  FaEdit, FaTrash, FaUpload, FaClock, 
  FaEye, FaLock, FaGlobeAmericas, FaBookOpen, FaListAlt,
  FaGripVertical, FaFileAlt 
} from 'react-icons/fa';
import type { Lesson } from '../../../types/lesson.types';

type Props = {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onStatusChange: (lesson: Lesson, status: string) => void;
  onUploadResource: (lesson: Lesson) => void;
  onViewResources?: (lesson: Lesson) => void;
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
};

const STATUS_CONFIG: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
  PUBLISHED: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    label: 'Đã xuất bản',
    icon: <FaGlobeAmericas size={10} />,
  },
  DRAFT: {
    className: 'bg-amber-50 text-amber-700 border-amber-200/60',
    label: 'Nháp',
    icon: <FaFileAlt size={10} />,
  },
  HIDDEN: {
    className: 'bg-rose-50 text-rose-700 border-rose-200/60',
    label: 'Đã ẩn',
    icon: <FaLock size={10} />,
  },
};

export function LessonItem({ 
  lesson, 
  index, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onUploadResource, 
  onViewResources,
  dragHandleProps,
  isDragging,
}: Props) {
  const statusConfig = STATUS_CONFIG[lesson.status] || STATUS_CONFIG.DRAFT;

  return (
    <div
      className={`group flex items-center gap-2 sm:gap-3.5 p-2.5 sm:p-4 bg-white hover:bg-cyan-50/20 transition-all rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs ${
        isDragging ? 'opacity-40 scale-[0.99] border-cyan-300 shadow-md ring-2 ring-cyan-500/10' : ''
      }`}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div 
          {...dragHandleProps} 
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-0.5 sm:p-1 flex-shrink-0 transition-colors"
          title="Kéo để sắp xếp"
        >
          <FaGripVertical className="text-xs sm:text-base" />
        </div>
      )}

      {/* Index Number */}
      <div className="flex-shrink-0">
        <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100/80 text-[11px] sm:text-xs font-bold text-slate-600 group-hover:bg-[#49BBBD]/10 group-hover:text-[#49BBBD] transition-colors">
          {index + 1}
        </span>
      </div>

      {/* Lesson Icon (Desktop Only) */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-[#49BBBD] hidden sm:flex">
        <FaBookOpen size={14} />
      </div>

      {/* Info Body */}
      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate group-hover:text-cyan-700 transition-colors">
            {lesson.title}
          </h3>
          {lesson.isFreePreview && (
            <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full font-semibold shrink-0">
              <FaEye size={8} className="sm:text-[9px]" /> 
              <span className="hidden sm:inline">Xem trước</span>
              <span className="sm:hidden">Free</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-slate-500 sm:text-slate-400">
            <FaClock size={9} className="text-slate-400 hidden sm:inline" />
            {lesson.duration 
              ? `${lesson.duration >= 60 ? Math.floor(lesson.duration / 60) + ' phút' : lesson.duration + ' phút'}` 
              : 'Chưa có thời lượng'}
          </span>

          {lesson.chapterTitle && (
            <>
              <span className="text-slate-200 hidden sm:inline">•</span>
              <span className="text-slate-400 font-medium truncate max-w-[90px] sm:max-w-[150px] hidden sm:inline">
                {lesson.chapterTitle}
              </span>
            </>
          )}

          {lesson.slug && (
            <>
              <span className="text-slate-200 hidden md:inline">•</span>
              <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[120px] sm:max-w-[160px] hidden md:inline">
                /{lesson.slug}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Badge (Desktop Only) */}
      <div className="flex-shrink-0 hidden lg:block">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex-shrink-0 flex items-center gap-0.5 sm:gap-1">
        {/* Status Dropdown */}
        <select
          value={lesson.status}
          onChange={(e) => onStatusChange(lesson, e.target.value)}
          className="hidden md:block px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-cyan-500/20 outline-none transition cursor-pointer shadow-2xs mr-1"
        >
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Xuất bản</option>
          <option value="HIDDEN">Ẩn</option>
        </select>

        {onViewResources && (
          <button
            onClick={() => onViewResources(lesson)}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Xem tài nguyên"
          >
            <FaListAlt size={13} className="sm:text-sm" />
          </button>
        )}

        <button
          onClick={() => onUploadResource(lesson)}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
          title="Tải tài nguyên"
        >
          <FaUpload size={13} className="sm:text-sm" />
        </button>

        <button
          onClick={() => onEdit(lesson)}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Chỉnh sửa"
        >
          <FaEdit size={13} className="sm:text-sm" />
        </button>

        <button
          onClick={() => onDelete(lesson)}
          className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Xóa"
        >
          <FaTrash size={13} className="sm:text-sm" />
        </button>
      </div>
    </div>
  );
}