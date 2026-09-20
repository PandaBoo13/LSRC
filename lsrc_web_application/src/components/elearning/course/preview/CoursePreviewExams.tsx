// src/components/elearning/course/preview/CoursePreviewExams.tsx
import React from 'react';
import type { ExamSession } from '../../../../types/exam.types';
import {
  FaClipboardCheck,
  FaClock,
  FaQuestionCircle,
  FaTrophy,
  FaRedo,
  FaCheckCircle,
} from 'react-icons/fa';

type Props = {
  exams: ExamSession[];
};

export const CoursePreviewExams: React.FC<Props> = ({ exams }) => {
  if (exams.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FaClipboardCheck size={26} />
        </div>
        <p className="text-sm font-bold text-slate-700">Chưa có bài kiểm tra nào</p>
        <p className="text-xs text-slate-400 mt-1">
          Khóa học này hiện chưa được gán đề thi hoặc bài tập trắc nghiệm.
        </p>
      </div>
    );
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Không giới hạn';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m > 0 ? `${m} phút` : ''}` : `${m} phút`;
  };

  return (
    <div className="space-y-5">
      {/* Thanh Tiêu Đề Số Lượng */}
      <div className="flex items-center gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs sm:text-sm font-bold text-[#2F327D]">
        <FaClipboardCheck className="text-[#49BBBD]" size={16} />
        <span>Tổng số bài kiểm tra: {exams.length} bài</span>
      </div>

      {/* Grid Đề Thi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.idSession}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-[#49BBBD]/40 transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            {/* Top Card Info */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm sm:text-base font-extrabold text-[#2F327D] line-clamp-2 leading-snug">
                  {exam.title}
                </h4>
                <span
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    exam.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                      : exam.status === 'CLOSED'
                      ? 'bg-red-50 text-red-500 border border-red-200/60'
                      : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                  }`}
                >
                  {exam.status === 'DRAFT' ? 'Nháp' : exam.status}
                </span>
              </div>

              {exam.description && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>
              )}
            </div>

            {/* Matrix Các Chỉ Số Bài Thi */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-[#49BBBD] flex items-center justify-center shrink-0">
                  <FaQuestionCircle size={12} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Số câu hỏi</span>
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {exam.totalQuestions || '?'} câu
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <FaClock size={12} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Thời gian làm</span>
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {formatDuration(exam.timeLimit)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <FaTrophy size={12} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Điểm đạt</span>
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {exam.passingScore || 50}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <FaRedo size={11} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Số lần thử</span>
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {exam.maxAttempts || 1} lần
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};