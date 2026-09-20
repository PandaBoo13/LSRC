// src/components/elearning/course/course-details/ChapterResourceList.tsx
import React from 'react';
import { 
  FaTimes, 
  FaLayerGroup, 
  FaChevronDown, 
  FaChevronRight, 
  FaFileAlt, 
  FaCloudUploadAlt,
  FaFolder,
  FaFolderOpen
} from 'react-icons/fa';
import type { Chapter } from '../../../../types/chapter.types';
import type { CourseResource } from '../../../../types/courseResource.types';

interface ChapterResourceListProps {
  chapters: Chapter[];
  resources: CourseResource[];
  expandedChapters: Record<number, boolean>;
  onToggleChapter: (chapterId: number) => void;
  onAssignToChapter: (chapterId: number, resourceId: number) => void;
  onUnassignFromChapter: (resourceId: number) => void;
}

export const ChapterResourceList: React.FC<ChapterResourceListProps> = ({
  chapters,
  resources,
  expandedChapters,
  onToggleChapter,
  onAssignToChapter,
  onUnassignFromChapter,
}) => {
  const getResourcesByChapterId = (chapterId: number): CourseResource[] => {
    return resources.filter((r: CourseResource) => r.chapterId === chapterId);
  };

  if (chapters.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-2">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mb-3 shadow-inner">
          <FaLayerGroup size={20} />
        </div>
        <p className="text-xs font-bold text-slate-700">Chưa có chương nào</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-medium">
          Khóa học chưa có cấu trúc chương. Tạo chương mới để gán bài học.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1.5 flex-1 custom-scrollbar">
      {chapters.map((chapter: Chapter) => {
        const isExpanded = !!expandedChapters[chapter.id];
        const chapterResources = getResourcesByChapterId(chapter.id);

        return (
          <div 
            key={chapter.id} 
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isExpanded 
                ? 'border-cyan-200 bg-white shadow-sm ring-1 ring-cyan-500/10' 
                : 'border-slate-200/80 bg-white hover:border-slate-300'
            }`}
          >
            {/* Chapter Accordion Header */}
            <button
              type="button"
              onClick={() => onToggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 hover:bg-slate-100/60 cursor-pointer select-none transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  isExpanded ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-cyan-50 text-cyan-600'
                }`}>
                  {isExpanded ? <FaFolderOpen size={14} /> : <FaFolder size={14} />}
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-800 truncate leading-snug">
                    {chapter.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {chapterResources.length} tài nguyên đã đính kèm
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  chapterResources.length > 0 
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/60' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {chapterResources.length}
                </span>
                <div className="w-6 h-6 flex items-center justify-center text-slate-400">
                  {isExpanded ? <FaChevronDown size={11} /> : <FaChevronRight size={11} />}
                </div>
              </div>
            </button>

            {/* Dropzone & Resource Items */}
            {isExpanded && (
              <div 
                className="p-3 space-y-2 bg-slate-50/50 border-t border-slate-100 min-h-[60px] transition-all"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const resourceId = Number(e.dataTransfer.getData('text/plain'));
                  if (resourceId) onAssignToChapter(chapter.id, resourceId);
                }}
              >
                {chapterResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-5 px-3 border-2 border-dashed border-slate-200/90 rounded-xl bg-white/60 hover:bg-white hover:border-cyan-400 transition-all group cursor-pointer">
                    <FaCloudUploadAlt className="text-slate-300 group-hover:text-cyan-500 text-xl mb-1.5 transition-colors" />
                    <p className="text-[11px] font-bold text-slate-500 group-hover:text-cyan-600 transition-colors">
                      Kéo & thả tài nguyên vào đây
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Để sắp xếp vào chương này</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chapterResources.map((resource: CourseResource) => (
                      <div 
                        key={resource.id} 
                        className="group flex items-center justify-between gap-2.5 py-2.5 px-3 rounded-xl bg-white border border-slate-200/70 hover:border-cyan-300 hover:shadow-sm transition-all duration-150"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-cyan-50/80 text-cyan-600 flex items-center justify-center shrink-0">
                            <FaFileAlt size={12} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                            {resource.title || resource.fileName || 'Không tên'}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => onUnassignFromChapter(resource.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                          title="Gỡ khỏi chương"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};