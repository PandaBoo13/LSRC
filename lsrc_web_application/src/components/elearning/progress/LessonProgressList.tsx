// src/components/progress/LessonProgressList.tsx
import React from 'react';
import { StatusBadge } from './StatusBadge';
import { TimeSpentDisplay } from './TimeSpentDisplay';
import { groupLessonsByChapter } from '../../../utils/progressUtils';
import type { LessonProgressListProps } from '../../../service/progress/progress.types';

export const LessonProgressList: React.FC<LessonProgressListProps> = ({
  lessons,
  courseId,
  onLessonClick,
  className = '',
}) => {
  const groupedLessons = groupLessonsByChapter(lessons);

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">Chưa có bài học nào</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedLessons).map(([chapterTitle, chapterLessons]) => (
        <div key={chapterTitle} className="bg-white rounded-lg shadow">
          {/* Chapter Header */}
          <div className="px-6 py-3 bg-gray-50 rounded-t-lg border-b">
            <h3 className="font-semibold text-gray-700">
              📁 {chapterTitle}
              <span className="ml-2 text-sm text-gray-500">
                ({chapterLessons.filter(l => l.status === 'COMPLETED').length}/{chapterLessons.length})
              </span>
            </h3>
          </div>

          {/* Lessons List */}
          <div className="divide-y divide-gray-200">
            {chapterLessons.map((lesson) => (
              <div
                key={lesson.idProgress}
                onClick={() => onLessonClick?.(lesson.lessonId)}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {lesson.status === 'COMPLETED' ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : lesson.status === 'IN_PROGRESS' ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{lesson.orderIndex}</span>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.lessonTitle}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusBadge status={lesson.status} />
                      <TimeSpentDisplay seconds={lesson.timeSpent} />
                      {lesson.score !== undefined && (
                        <span className="text-sm text-gray-500">
                          Điểm: {lesson.score}/{lesson.maxScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};