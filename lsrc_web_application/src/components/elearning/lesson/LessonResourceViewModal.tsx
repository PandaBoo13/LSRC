// src/components/elearning/lesson/LessonResourceViewModal.tsx
import { useState, useCallback } from 'react';
import { FaTimes, FaUpload, FaBookOpen } from 'react-icons/fa';
import { LessonResourceList } from './LessonResourceList';
// ✅ THAY ĐỔI: Bỏ Lesson type, dùng CourseResource
import type { CourseResource } from '../../../types/courseResource.types';

type Props = {
  // ✅ THAY ĐỔI: Lesson → CourseResource
  lesson: CourseResource;
  courseId: number;
  isInstructor?: boolean;
  onClose: () => void;
  onUploadClick?: () => void;
};

export function LessonResourceViewModal({ 
  lesson,
  courseId,
  isInstructor = false, 
  onClose, 
  onUploadClick 
}: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // ✅ THAY ĐỔI: Xử lý title null
  const lessonTitle = lesson.title || lesson.fileName || 'Không tên';

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
              <FaBookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-900 truncate">
                Tài nguyên bài học
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[350px]">
                {lessonTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition flex-shrink-0"
            aria-label="Đóng"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <LessonResourceList 
            key={refreshKey}
            // ✅ THAY ĐỔI: idLesson → id
            lessonId={lesson.id}
            courseId={courseId}
            isInstructor={isInstructor}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Footer - Only for Instructor */}
        {isInstructor && onUploadClick && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center flex-shrink-0 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Hỗ trợ: Video, PDF, Audio, Slide, SCORM, Hình ảnh, Tài liệu...
            </p>
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 transition shadow-lg shadow-cyan-200/50"
            >
              <FaUpload size={14} />
              Thêm tài nguyên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}