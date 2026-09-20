// src/components/elearning/quiz/QuizHistory.tsx
import { useState } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaHistory,
  FaRedo,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
} from 'react-icons/fa';
import type {
  QuizAttempt,
  QuizQuestionItem,
  QuizOptionItem,
} from '../../../service/quiz/quiz.types';
import { RichTextDisplay } from '../../ui/RichTextEditor/RichTextDisplay';

type Props = {
  attempts: QuizAttempt[];
  onRetry?: () => void;
};

interface AnswerItem {
  questionId: number;
  selectedOptions: string[];
}

export function QuizHistory({ attempts, onRetry }: Props) {
  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);

  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <FaHistory className="text-3xl text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-400">
          Bạn chưa thực hiện lượt làm bài nào
        </p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * ✅ FIX: Parse đúng format BE trả về.
   *
   * Format từ DB (`attempt.answers`):
   *   {
   *     "questionIds": [1, 2, 3],
   *     "userAnswers": [{"questionId": 1, "selectedOptions": ["A"]}, ...]
   *   }
   *
   * → Lấy `userAnswers`, KHÔNG lấy cả object.
   */
  const parseAnswers = (answersJson?: string | null): AnswerItem[] => {
    if (!answersJson) return [];

    try {
      const parsed = JSON.parse(answersJson);

      // ✅ Format cũ: object { questionIds, userAnswers }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const userAnswers = parsed.userAnswers;
        if (Array.isArray(userAnswers)) {
          return userAnswers.filter(
            (item: any) =>
              item &&
              typeof item === 'object' &&
              typeof item.questionId === 'number' &&
              Array.isArray(item.selectedOptions)
          );
        }
        return [];
      }

      // Fallback: nếu là array thẳng (dùng cho trường hợp khác)
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item: any) =>
            item &&
            typeof item === 'object' &&
            typeof item.questionId === 'number' &&
            Array.isArray(item.selectedOptions)
        );
      }

      return [];
    } catch {
      return [];
    }
  };

  const toggleExpand = (attemptId: number) => {
    setExpandedAttemptId((prev) => (prev === attemptId ? null : attemptId));
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <FaHistory className="text-teal-500" size={13} /> Lịch sử lượt làm ({attempts.length})
        </h3>
      </div>

      {/* List */}
      <div className="space-y-3">
        {attempts.map((attempt) => {
          const percentage =
            attempt.maxScore > 0
              ? Math.round((attempt.score / attempt.maxScore) * 100)
              : 0;
          const isExpanded = expandedAttemptId === attempt.attemptId;
          const answerDetails = parseAnswers(attempt.answers);
          const questions = attempt.questions || [];

          return (
            <div
              key={attempt.attemptId}
              className={`rounded-2xl border transition-all ${
                attempt.isPassed
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-rose-50/40 border-rose-200/80'
              }`}
            >
              {/* Header - Clickable */}
              <button
                onClick={() => toggleExpand(attempt.attemptId)}
                className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 transition rounded-2xl"
              >
                {/* Left */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${
                      attempt.isPassed
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    }`}
                  >
                    {attempt.isPassed ? <FaCheckCircle size={18} /> : <FaTimesCircle size={18} />}
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">
                        Lượt #{attempt.attemptNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          attempt.isPassed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {attempt.isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Thực hiện: {formatDate(attempt.submittedAt)}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <FaClock className="text-slate-400" size={11} />
                    <span>{formatTime(attempt.timeSpent || 0)}</span>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span
                        className={`text-base font-black ${
                          attempt.isPassed ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        ({attempt.score}/{attempt.maxScore} pt)
                      </span>
                    </div>
                    {isExpanded ? (
                      <FaChevronUp size={12} className="text-slate-400" />
                    ) : (
                      <FaChevronDown size={12} className="text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-200/60 p-4 space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                    <FaQuestionCircle size={11} /> Chi tiết câu hỏi ({questions.length} câu)
                  </p>

                  {questions.length === 0 && (
                    <p className="text-xs text-slate-400 italic">
                      Không có dữ liệu câu hỏi chi tiết cho lượt làm này.
                    </p>
                  )}

                  <div className="space-y-3">
                    {questions.map((question: QuizQuestionItem, idx: number) => {
                      const studentAnswer = answerDetails.find(
                        (a) => a.questionId === question.questionId
                      );
                      const selectedOptions = studentAnswer?.selectedOptions || [];

                      return (
                        <div
                          key={question.questionId}
                          className="bg-white/70 rounded-xl p-3 border border-slate-100"
                        >
                          <div className="text-xs font-bold text-slate-700 mb-2 flex items-start gap-1">
                            <span className="text-[#49BBBD] shrink-0">
                              Câu {idx + 1}:
                            </span>
                            <RichTextDisplay
                              content={question.content}
                              prose={false}
                              className="inline prose prose-slate prose-xs max-w-none prose-p:inline prose-p:m-0"
                            />
                          </div>

                          <div className="space-y-1.5">
                            {question.options?.map((option: QuizOptionItem) => {
                              const isSelected = selectedOptions.includes(option.label);

                              return (
                                <div
                                  key={option.label}
                                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                                    isSelected
                                      ? 'bg-[#49BBBD]/10 text-[#49BBBD] font-bold border border-[#49BBBD]/30'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {isSelected ? (
                                    <FaCheckCircle
                                      size={11}
                                      className="text-[#49BBBD] shrink-0"
                                    />
                                  ) : (
                                    <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                                  )}
                                  <span className="font-bold">{option.label}.</span>
                                  <span>{option.content}</span>
                                </div>
                              );
                            })}
                          </div>

                          {selectedOptions.length === 0 && (
                            <p className="text-[11px] text-rose-500 italic mt-1">
                              ✗ Chưa chọn đáp án
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Retry Action */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full mt-2 py-3 rounded-2xl border border-teal-500/30 bg-teal-50/50 hover:bg-teal-50 text-teal-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <FaRedo size={12} /> Thử lại lượt khác
        </button>
      )}
    </div>
  );
}