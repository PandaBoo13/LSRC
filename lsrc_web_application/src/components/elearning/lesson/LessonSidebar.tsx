// src/components/elearning/learning/LessonSidebar.tsx
import { useState } from 'react';
import { FaLock, FaCheckCircle, FaPlay, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import type { Chapter } from '../../../types/chapter.types';
import type { CourseResource } from '../../../types/courseResource.types';

type Props = {
  chapters: Chapter[];
  allLessons: CourseResource[];  // ✅ Thêm prop
  currentLessonId: number;
  completedLessonIds: number[];
  onLessonClick: (lessonId: number) => void;
};

export function LessonSidebar({ 
  chapters, 
  allLessons,  // ✅ Nhận từ props
  currentLessonId, 
  completedLessonIds, 
  onLessonClick 
}: Props) {
  const [expandedChapters, setExpandedChapters] = useState<number[]>(() => {
    const currentChapter = chapters.find((ch: Chapter) => {
      const chapterResources = (ch as any).resources || [];
      return chapterResources.some((r: CourseResource) => r.id === currentLessonId);
    });
    return currentChapter ? [currentChapter.id] : [];
  });

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId) 
        : [...prev, chapterId]
    );
  };

  // ✅ Helper lấy resources từ chapter
  const getChapterResources = (chapter: Chapter): CourseResource[] => {
    return (chapter as any).resources || [];
  };

  const getLessonStatus = (lessonId: number): 'completed' | 'active' | 'available' | 'locked' => {
    if (lessonId === currentLessonId) return 'active';
    if (completedLessonIds.includes(lessonId)) return 'completed';
    
    const index = allLessons.findIndex(l => l.id === lessonId);
    
    if (index === 0) return 'available';
    
    const prevLesson = allLessons[index - 1];
    if (prevLesson && !completedLessonIds.includes(prevLesson.id)) {
      return 'locked';
    }
    
    return 'available';
  };

  const totalLessons = allLessons.length;

  return (
    <div className="rounded-2xl bg-white p-4 text-slate-700 shadow-sm border border-slate-200/80">
      {/* Header */}
      <div className="px-2 pb-3 border-b border-slate-200">
        <h3 className="text-base font-bold text-[#2F327D]">Nội dung khóa học</h3>
        <p className="text-xs text-slate-400 mt-1">
          {totalLessons} bài học • {completedLessonIds.length} đã hoàn thành
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 px-2">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full rounded-full bg-[#49BBBD] transition-all duration-300"
            style={{ width: `${totalLessons > 0 ? (completedLessonIds.length / totalLessons) * 100 : 0}%` }}
          />
        </div>
      </div>
      
      {/* Chapter List */}
      <div className="mt-3 space-y-1 max-h-[600px] overflow-y-auto pr-1">
        {chapters.map((chapter: Chapter) => {
          const isExpanded = expandedChapters.includes(chapter.id);
          const chapterResources = getChapterResources(chapter);
          const completedInChapter = chapterResources.filter((r: CourseResource) => 
            completedLessonIds.includes(r.id)
          ).length;

          return (
            <div key={chapter.id} className="rounded-xl overflow-hidden">
              {/* Chapter Header */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left hover:bg-[#49BBBD]/5 transition"
              >
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs ${
                  isExpanded 
                    ? 'bg-[#49BBBD] text-white' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                </span>
                
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#2F327D] truncate">
                    {chapter.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {completedInChapter}/{chapterResources.length} bài hoàn thành
                  </span>
                </span>
              </button>

              {/* Lessons */}
              {isExpanded && chapterResources.length > 0 && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
                  {chapterResources.map((lesson: CourseResource) => {
                    const status = getLessonStatus(lesson.id);
                    const isActive = status === 'active';
                    const isCompleted = status === 'completed';
                    const isLocked = status === 'locked';
                    
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => !isActive && onLessonClick(lesson.id)}
                        disabled={isActive}
                        className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition ${
                          isActive
                            ? 'bg-[#49BBBD]/15 border border-[#49BBBD]/30 text-[#2F327D] cursor-default'
                            : isCompleted
                            ? 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                            : 'text-slate-400 hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs ${
                          isActive
                            ? 'bg-[#49BBBD] text-white'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-500'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isCompleted ? <FaCheckCircle size={12} /> : isActive ? <FaPlay size={10} /> : isLocked ? <FaLock size={8} /> : <FaPlay size={10} />}
                        </span>
                        
                        <span className="flex-1 min-w-0">
                          <span className={`block text-xs font-medium truncate ${
                            isActive ? 'text-[#2F327D]' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {lesson.title || lesson.fileName || 'Không tên'}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                            {lesson.duration ? <span>{Math.floor(lesson.duration / 60)} phút</span> : null}
                            {lesson.isFreePreview && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-500 text-[10px] font-medium">
                                Free
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {chapters.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Chưa có bài học nào</p>
          </div>
        )}
      </div>
    </div>
  );
}