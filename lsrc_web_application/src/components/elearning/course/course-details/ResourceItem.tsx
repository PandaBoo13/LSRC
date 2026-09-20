// src/components/elearning/course/course-details/ResourceItem.tsx
import React from 'react';
import { FaTrash, FaCheckCircle, FaCircle } from 'react-icons/fa';
import type { CourseResource } from '../../../../types/courseResource.types';

const RESOURCE_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  VIDEO: { label: 'Video', icon: '🎬', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  PDF: { label: 'PDF', icon: '📄', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  AUDIO: { label: 'Audio', icon: '🎵', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  SLIDE: { label: 'Slide', icon: '📊', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  SCORM: { label: 'SCORM', icon: '📦', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  DOCUMENT: { label: 'Tài liệu', icon: '📝', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  IMAGE: { label: 'Hình ảnh', icon: '🖼️', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  LINK: { label: 'Link', icon: '🔗', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  OTHER: { label: 'Khác', icon: '📁', color: 'bg-slate-50 text-slate-600 border-slate-200' },
};

interface ResourceItemProps {
  resource: CourseResource;
  isAssigned: boolean;
  assignedChapterTitle?: string;
  onDelete: (resource: CourseResource) => void;
  onDragStart: (e: React.DragEvent, resourceId: number) => void;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  resource,
  isAssigned,
  assignedChapterTitle,
  onDelete,
  onDragStart,
}) => {
  const typeConfig = RESOURCE_TYPE_LABELS[resource.resourceType] || RESOURCE_TYPE_LABELS.OTHER;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, resource.id)}
      className="group p-3 rounded-xl border border-slate-200 bg-white cursor-grab active:cursor-grabbing hover:border-[#49BBBD]/50 hover:shadow-sm transition"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 ${typeConfig.color}`}>
          {typeConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-bold text-slate-800 truncate">{resource.title || resource.fileName || 'Không tên'}</h5>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded-md font-semibold ${typeConfig.color}`}>{typeConfig.label}</span>
            {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
          </div>
          {/* ✅ Trạng thái gán */}
          <div className="mt-1.5">
            {isAssigned ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <FaCheckCircle size={9} /> Đã gán: {assignedChapterTitle || 'Chương'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                <FaCircle size={9} /> Chưa gán
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(resource); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100 shrink-0"
          title="Xóa"
        >
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  );
};