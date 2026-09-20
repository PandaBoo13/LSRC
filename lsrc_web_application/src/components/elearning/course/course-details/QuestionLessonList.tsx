// src/components/elearning/course/course-details/QuestionLessonList.tsx
import React from 'react';
import { FaChevronDown, FaChevronRight, FaFolder, FaBook, FaFolderOpen } from 'react-icons/fa';
import type { Chapter } from '../../../../types/chapter.types';
import type { CourseResource } from '../../../../types/courseResource.types';

interface QuestionLessonListProps {
  chapters: Chapter[];
  lessons: CourseResource[];
  selectedLessonId: number | null;
  expandedChapters: Set<number>;
  onToggleChapter: (chapterId: number) => void;
  onSelectLesson: (lesson: CourseResource) => void;
}

export const QuestionLessonList: React.FC<QuestionLessonListProps> = ({
  chapters,
  lessons,
  selectedLessonId,
  expandedChapters,
  onToggleChapter,
  onSelectLesson,
}) => {
  const getLessonsByChapter = (chapterId: number): CourseResource[] => {
    return lessons.filter((l: CourseResource) => l.chapterId === chapterId);
  };

  // Empty State - Chưa có chương nào
  if (chapters.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FaFolder size={20} />
        </div>
        <p className="text-xs font-bold text-slate-600">Chưa có chương học nào</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Nội dung chương sẽ hiển thị tại đây khi được thêm vào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {chapters.map((chapter: Chapter, chapterIndex: number) => {
        const chapterLessons = getLessonsByChapter(chapter.id);
        const isExpanded = expandedChapters.has(chapter.id);
        
        return (
          <div 
            key={chapter.id} 
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isExpanded 
                ? 'border-slate-300 bg-white shadow-sm' 
                : 'border-slate-200/80 bg-white hover:border-slate-300'
            }`}
          >
            {/* Chapter Header */}
            <button
              onClick={() => onToggleChapter(chapter.id)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isExpanded ? 'bg-cyan-500/10 text-cyan-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isExpanded ? <FaFolderOpen size={13} /> : <FaFolder size={12} />}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                    Chương {chapterIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {chapter.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                  {chapterLessons.length} bài
                </span>
                <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                  {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                </div>
              </div>
            </button>

            {/* Lessons List */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50/40 p-1 space-y-1">
                {chapterLessons.length === 0 ? (
                  <p className="py-4 text-[11px] text-slate-400 italic text-center font-medium">
                    Chưa có bài học trong chương này
                  </p>
                ) : (
                  chapterLessons.map((lesson: CourseResource, lessonIndex: number) => {
                    const isSelected = selectedLessonId === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-500/10 text-cyan-900 border-l-4 border-cyan-500 shadow-sm'
                            : 'hover:bg-slate-100/80 border-l-4 border-transparent text-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-200/60 text-slate-500'
                        }`}>
                          <FaBook size={10} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className={`text-[10px] font-bold block leading-tight ${
                            isSelected ? 'text-cyan-700' : 'text-slate-400'
                          }`}>
                            Bài {chapterIndex + 1}.{lessonIndex + 1}
                          </span>
                          <p className={`text-xs truncate ${
                            isSelected ? 'font-bold text-cyan-950' : 'font-medium text-slate-700'
                          }`}>
                            {lesson.title || lesson.fileName || 'Không tên'}
                          </p>
                        </div>

                        {/* Badge hiển thị số câu hỏi */}
                        {lesson.questionCount !== undefined && lesson.questionCount > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                            isSelected 
                              ? 'bg-cyan-500 text-white border-cyan-500' 
                              : 'bg-white text-cyan-700 border-cyan-200/80 shadow-2xs'
                          }`}>
                            {lesson.questionCount} câu
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};