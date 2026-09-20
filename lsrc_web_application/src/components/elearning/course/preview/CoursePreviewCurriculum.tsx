// src/components/elearning/course/preview/CoursePreviewCurriculum.tsx
import React, { useState } from 'react';
import type { Chapter } from '../../../../types/chapter.types';
import type { CourseResource } from '../../../../types/courseResource.types';
import {
  FaChevronDown,
  FaChevronRight,
  FaPlay,
  FaLock,
  FaFileAlt,
  FaClock,
  FaBookOpen,
  FaCompressAlt,
  FaExpandAlt,
  FaClipboardCheck,
  FaFilePdf,
  FaLink,
} from 'react-icons/fa';

type Props = {
  chapters: Chapter[];
  resources?: CourseResource[];
};

export const CoursePreviewCurriculum: React.FC<Props> = ({ chapters, resources = [] }) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(() => {
    return new Set(chapters.map((c) => c.id)); // ✅ Đổi idChapter → id
  });

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedChapters.size === chapters.length) {
      setExpandedChapters(new Set());
    } else {
      setExpandedChapters(new Set(chapters.map((c) => c.id))); // ✅ Đổi idChapter → id
    }
  };

  // ✅ Lấy resources theo chapter
  const getResourcesByChapter = (chapterId: number) => {
    return resources.filter(r => r.chapterId === chapterId);
  };

  // ✅ Lấy resources không thuộc chapter nào
  const getUnassignedResources = () => {
    return resources.filter(r => !r.chapterId);
  };

  // ✅ Tính tổng số resources (bài học)
  const totalResources = resources.length;
  
  // ✅ Tính tổng thời lượng
  const totalDuration = resources.reduce((sum, r) => sum + (r.duration || 0), 0);

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0 phút';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m > 0 ? `${m} phút` : ''}` : `${m} phút`;
  };

  // ✅ Icon theo resource type
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'VIDEO':
        return <FaPlay size={9} className="text-[#2F327D]" />;
      case 'QUIZ':
        return <FaClipboardCheck size={10} className="text-amber-600" />;
      case 'PDF':
      case 'DOCUMENT':
        return <FaFilePdf size={10} className="text-red-500" />;
      case 'LINK':
        return <FaLink size={10} className="text-blue-500" />;
      default:
        return <FaFileAlt size={10} className="text-slate-500" />;
    }
  };

  // ✅ Label cho resource type
  const getResourceTypeLabel = (resourceType: string) => {
    const labels: Record<string, string> = {
      'VIDEO': 'Video',
      'QUIZ': 'Quiz',
      'PDF': 'PDF',
      'SLIDE': 'Slide',
      'DOCUMENT': 'Tài liệu',
      'AUDIO': 'Audio',
      'IMAGE': 'Hình ảnh',
      'LINK': 'Link',
      'OTHER': 'Khác',
    };
    return labels[resourceType] || resourceType;
  };

  if (chapters.length === 0 && resources.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FaFileAlt size={24} />
        </div>
        <p className="text-sm font-bold text-slate-700">Chưa có nội dung chương trình học</p>
        <p className="text-xs text-slate-400 mt-1">
          Hãy thêm các chương và bài học chi tiết cho khóa học này.
        </p>
      </div>
    );
  }

  const isAllExpanded = expandedChapters.size === chapters.length;

  return (
    <div className="space-y-5">
      {/* Thanh Thống Kê Tổng Quan & Nút Thu Mở Tất Cả */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#2F327D] font-bold">
            <FaBookOpen className="text-[#49BBBD]" size={14} />
            <span>{chapters.length} chương</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>{totalResources} tài nguyên</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <FaClock className="text-slate-400" size={13} />
            <span>Tổng thời lượng: <strong>{formatDuration(totalDuration)}</strong></span>
          </div>
        </div>

        {chapters.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#49BBBD] hover:text-[#3da8aa] hover:bg-cyan-50 px-3 py-1.5 rounded-xl transition self-end sm:self-auto"
          >
            {isAllExpanded ? (
              <>
                <FaCompressAlt size={11} /> Thu gọn tất cả
              </>
            ) : (
              <>
                <FaExpandAlt size={11} /> Mở rộng tất cả
              </>
            )}
          </button>
        )}
      </div>

      {/* Danh Sách Các Chapter */}
      <div className="space-y-3.5">
        {chapters.map((chapter, chIdx) => {
          const isExpanded = expandedChapters.has(chapter.id); // ✅ Đổi idChapter → id
          const chapterResources = getResourcesByChapter(chapter.id); // ✅ Đổi idChapter → id
          const chapterDuration = chapterResources.reduce((sum, r) => sum + (r.duration || 0), 0);

          return (
            <div
              key={chapter.id} // ✅ Đổi idChapter → id
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-slate-300/80 shadow-xs bg-white'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {/* Chapter Header */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)} // ✅ Đổi idChapter → id
                className="w-full flex items-center justify-between p-4 text-left transition select-none group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isExpanded
                        ? 'bg-cyan-50 text-[#49BBBD]'
                        : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-[#49BBBD] uppercase tracking-wider block">
                      Chương {chIdx + 1 < 10 ? `0${chIdx + 1}` : chIdx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-[#2F327D] truncate mt-0.5">
                      {chapter.title}
                    </h4>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-500 block">
                    {chapterResources.length} tài nguyên
                  </span>
                  {chapterDuration > 0 && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {formatDuration(chapterDuration)}
                    </span>
                  )}
                </div>
              </button>

              {/* Resources List */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-white divide-y divide-slate-100">
                  {chapterResources.length > 0 ? (
                    chapterResources.map((resource, rIdx) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-slate-50/80 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <span className="text-xs font-bold text-slate-400 w-6 shrink-0 text-center">
                            {chIdx + 1}.{rIdx + 1}
                          </span>

                          {/* Resource Type Icon */}
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            {getResourceIcon(resource.resourceType || 'OTHER')}
                          </div>

                          <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                            {resource.title || resource.fileName || 'Không tên'}
                          </span>

                          {/* Resource Type Badge */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">
                            {getResourceTypeLabel(resource.resourceType || 'OTHER')}
                          </span>

                          {resource.isFreePreview && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200/60 shrink-0">
                              Học thử
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                          {resource.duration ? (
                            <span className="font-medium text-slate-500">
                              {formatDuration(resource.duration)}
                            </span>
                          ) : null}

                          {resource.status === 'PUBLISHED' ? (
                            <span className="p-1 rounded-full bg-emerald-50 text-emerald-500">
                              <FaPlay size={8} />
                            </span>
                          ) : (
                            <span className="p-1 rounded-full bg-slate-100 text-slate-400">
                              <FaLock size={9} />
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-xs text-slate-400 italic bg-slate-50/30">
                      Chưa có tài nguyên nào trong chương này.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resources không thuộc chapter nào */}
      {getUnassignedResources().length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-bold text-[#2F327D] mb-3 flex items-center gap-2">
            <FaFileAlt size={13} className="text-[#49BBBD]" />
            Tài nguyên bổ sung ({getUnassignedResources().length})
          </h4>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-white divide-y divide-slate-100">
              {getUnassignedResources().map((resource, rIdx) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <span className="text-xs font-bold text-slate-400 w-6 shrink-0 text-center">
                      {rIdx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      {getResourceIcon(resource.resourceType || 'OTHER')}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                      {resource.title || resource.fileName || 'Không tên'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">
                      {getResourceTypeLabel(resource.resourceType || 'OTHER')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    {resource.duration ? (
                      <span className="font-medium text-slate-500">
                        {formatDuration(resource.duration)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};