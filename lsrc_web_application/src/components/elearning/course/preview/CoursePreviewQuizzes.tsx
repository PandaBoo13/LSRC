// src/components/elearning/course/preview/CoursePreviewQuizzes.tsx
import React from 'react';
import { 
  FaClipboardList, 
  FaClock, 
  FaQuestionCircle, 
  FaCheckCircle,
  FaRandom,
  FaHashtag
} from 'react-icons/fa';
import type { CourseResource } from '../../../../types/courseResource.types';

interface CoursePreviewQuizzesProps {
  quizzes: CourseResource[];
}

export const CoursePreviewQuizzes: React.FC<CoursePreviewQuizzesProps> = ({ quizzes }) => {
  // Format thời gian
  const formatTime = (minutes?: number) => {
    if (!minutes) return 'Không giới hạn';
    if (minutes < 60) return `${minutes} phút`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m > 0 ? `${m} phút` : ''}` : `${m} phút`;
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-[#49BBBD]/10 text-[#49BBBD] mx-auto flex items-center justify-center text-2xl mb-3">
          <FaClipboardList />
        </div>
        <p className="text-sm font-bold text-[#2F327D]">Chưa có quiz nào</p>
        <p className="text-xs text-slate-400 mt-1">Khóa học này chưa có bài kiểm tra.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2F327D] flex items-center gap-2">
          <FaClipboardList size={14} className="text-[#49BBBD]" />
          Danh sách Quiz ({quizzes.length})
        </h3>
      </div>

      {/* Quiz List */}
      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition"
          >
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {quiz.title}
                  {quiz.status === 'PUBLISHED' ? (
                    <FaCheckCircle size={12} className="text-emerald-500" />
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">
                      Nháp
                    </span>
                  )}
                </h4>
                {quiz.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FaQuestionCircle size={11} className="text-[#49BBBD]" />
                <strong>{quiz.totalQuestions || 0}</strong> câu hỏi
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FaClock size={11} className="text-[#49BBBD]" />
                {formatTime(quiz.timeLimit)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FaCheckCircle size={11} className="text-emerald-500" />
                Điểm đỗ: <strong>{quiz.passingScore}%</strong>
              </span>
              {quiz.maxAttempts && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <FaRandom size={11} className="text-purple-500" />
                  Số lần làm: <strong>{quiz.maxAttempts}</strong>
                </span>
              )}
              {quiz.shuffleQuestions && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <FaRandom size={11} className="text-blue-500" />
                  Xáo trộn câu hỏi
                </span>
              )}
            </div>

            {/* Hashtag Filter */}
            {quiz.hashtagFilter && (
              <div className="mt-3 flex items-center gap-2">
                <FaHashtag size={11} className="text-slate-400" />
                <span className="text-xs text-slate-500">{quiz.hashtagFilter}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};