// src/components/elearning/course/course-details/QuizProgressCard.tsx
import type { ReactNode } from 'react';
import {
  FaClipboardCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaRedo,
  FaPlay,
  FaEye,
  FaInfoCircle,
} from 'react-icons/fa';
import type { CourseResource } from '../../../../types/courseResource.types';
import type { ProgressResponse } from '../../../../service/progress/progress.types';

export type QuizActionMode = 'attempt' | 'viewStudent';
export type QuizViewerRole = 'STUDENT' | 'INSTRUCTOR' | 'TEACHER' | 'ADMIN';

interface QuizProgressCardProps {
  resources: CourseResource[];
  resourceProgressMap: Record<number, ProgressResponse>;
  onStartQuiz?: (quiz: CourseResource, mode: QuizActionMode) => void;
  userRole?: QuizViewerRole;
  /** self = xem quiz của chính mình. observed = xem tiến độ của người khác */
  variant?: 'self' | 'observed';
}

export function QuizProgressCard({
  resources,
  resourceProgressMap,
  onStartQuiz,
  userRole = 'STUDENT',
  variant = 'self',
}: QuizProgressCardProps) {
  const isPrivileged =
    userRole === 'INSTRUCTOR' ||
    userRole === 'TEACHER' ||
    userRole === 'ADMIN';

  const isObserved = variant === 'observed';
  const showStudentStats = isObserved || !isPrivileged;
  const usePreviewBadge = isPrivileged && !isObserved;

  const quizResources = resources.filter((r) => r.resourceType === 'QUIZ');
  const totalQuizzes = quizResources.length;
  const doneQuizzes = quizResources.filter(
    (q) => (resourceProgressMap[q.id]?.attempts ?? 0) > 0
  ).length;
  const notDoneQuizzes = totalQuizzes - doneQuizzes;
  const passedQuizzes = quizResources.filter(
    (q) => resourceProgressMap[q.id]?.isPassed === true
  ).length;

  if (totalQuizzes === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <FaClipboardCheck className="text-amber-500" /> Tình trạng làm Quiz
        </h2>
        <div className="text-center py-8 text-slate-400">
          <FaClipboardCheck className="text-4xl mx-auto mb-2 opacity-30" />
          <p className="text-sm">Khóa học chưa có quiz nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <FaClipboardCheck className="text-amber-500" /> Tình trạng làm Quiz
      </h2>

      {/* Banner */}
      {isPrivileged && !isObserved && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-cyan-50 border border-cyan-200 p-3 text-xs text-cyan-800">
          <FaInfoCircle className="mt-0.5 shrink-0" size={12} />
          <p>
            Bạn đang xem với vai trò <strong>giảng viên</strong>. Bấm{' '}
            <strong>"Xem chi tiết"</strong> để mở trang quiz như học viên thấy.
          </p>
        </div>
      )}

      {isPrivileged && isObserved && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-cyan-50 border border-cyan-200 p-3 text-xs text-cyan-800">
          <FaInfoCircle className="mt-0.5 shrink-0" size={12} />
          <p>
            Đây là <strong>tiến độ của học viên</strong>. Bấm{' '}
            <strong>"Xem chi tiết"</strong> để mở trang quiz của học viên này
            (bao gồm lịch sử làm bài của họ).
          </p>
        </div>
      )}

      {/* Stats tổng */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{totalQuizzes}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Tổng</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{doneQuizzes}</p>
          <p className="text-[10px] text-emerald-700 font-bold uppercase mt-1">Đã làm</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{notDoneQuizzes}</p>
          <p className="text-[10px] text-amber-700 font-bold uppercase mt-1">Chưa làm</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {quizResources.map((quiz) => {
          const progress = resourceProgressMap[quiz.id];
          const attempts = progress?.attempts ?? 0;
          const maxAttempts = quiz.maxAttempts ?? null;
          const score = progress?.score ?? null;
          const maxScore = progress?.maxScore ?? null;
          const isPassed = progress?.isPassed === true;
          const hasAttempted = attempts > 0;
          const attemptsLeft = maxAttempts ? maxAttempts - attempts : null;
          const canRetake = attemptsLeft === null || attemptsLeft > 0;

          const statusDisplay = usePreviewBadge
            ? {
                label: 'XEM TRƯỚC',
                bg: 'bg-cyan-100',
                text: 'text-cyan-700',
                icon: <FaEye size={9} />,
              }
            : isPassed
              ? {
                  label: 'ĐẠT',
                  bg: 'bg-emerald-100',
                  text: 'text-emerald-700',
                  icon: <FaCheckCircle size={9} />,
                }
              : hasAttempted
                ? {
                    label: 'CHƯA ĐẠT',
                    bg: 'bg-rose-100',
                    text: 'text-rose-700',
                    icon: <FaTimesCircle size={9} />,
                  }
                : {
                    label: 'CHƯA LÀM',
                    bg: 'bg-slate-200',
                    text: 'text-slate-600',
                    icon: <FaHourglassHalf size={9} />,
                  };

          const borderClass = usePreviewBadge
            ? 'border-cyan-200 bg-cyan-50/30'
            : isPassed
              ? 'border-emerald-200 bg-emerald-50/30'
              : hasAttempted
                ? 'border-rose-200 bg-rose-50/30'
                : 'border-slate-200 bg-slate-50/40';

          let buttonConfig: {
            label: string;
            icon: ReactNode;
            className: string;
            disabled: boolean;
            mode: QuizActionMode;
          };

          if (isPrivileged) {
            // Teacher/Admin (cả self và observed) → mở QuizPage
            buttonConfig = {
              label: 'Xem chi tiết',
              icon: <FaEye size={10} />,
              className:
                'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border-cyan-200',
              disabled: false,
              mode: 'viewStudent', // ✅ Đổi từ 'preview' → 'viewStudent'
            };
          } else if (isPassed) {
            buttonConfig = {
              label: 'Xem lại',
              icon: <FaEye size={10} />,
              className:
                'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
              disabled: false,
              mode: 'attempt',
            };
          } else if (hasAttempted) {
            buttonConfig = canRetake
              ? {
                  label: 'Làm lại',
                  icon: <FaRedo size={10} />,
                  className:
                    'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
                  disabled: false,
                  mode: 'attempt',
                }
              : {
                  label: 'Hết lượt',
                  icon: <FaHourglassHalf size={10} />,
                  className:
                    'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed',
                  disabled: true,
                  mode: 'attempt',
                };
          } else {
            buttonConfig = {
              label: 'Làm bài',
              icon: <FaPlay size={10} />,
              className:
                'bg-[#49BBBD] text-white hover:bg-[#3fa2a4] border-[#49BBBD]',
              disabled: false,
              mode: 'attempt',
            };
          }

          return (
            <div
              key={quiz.id}
              className={`p-4 rounded-2xl border ${borderClass} transition`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-slate-800 line-clamp-2 flex-1">
                  {quiz.title}
                </h3>
                <span
                  className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${statusDisplay.bg} ${statusDisplay.text}`}
                >
                  {statusDisplay.icon}
                  {statusDisplay.label}
                </span>
              </div>

              {showStudentStats &&
                (hasAttempted ? (
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Số lần làm
                      </p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {attempts}
                        {maxAttempts ? ` / ${maxAttempts}` : ''} lần
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Điểm cao nhất
                      </p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {score != null && maxScore != null
                          ? `${Number(score).toFixed(1)} / ${Number(maxScore).toFixed(1)}`
                          : '—'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <FaHourglassHalf size={10} className="text-amber-500" />
                    <span>Chưa làm lần nào</span>
                  </div>
                ))}

              {isPrivileged && !isObserved && (
                <p className="text-[11px] text-cyan-700/70 mb-3 italic">
                  Mở trang quiz để xem nội dung như học viên — không tạo lượt làm bài.
                </p>
              )}

              {showStudentStats && progress?.lastAccessedAt && hasAttempted && (
                <p className="text-[10px] text-slate-400 mb-3">
                  Lần làm gần nhất:{' '}
                  {new Date(progress.lastAccessedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}

              {onStartQuiz && (
                <button
                  type="button"
                  onClick={() =>
                    !buttonConfig.disabled &&
                    onStartQuiz(quiz, buttonConfig.mode)
                  }
                  disabled={buttonConfig.disabled}
                  className={`w-full mt-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${buttonConfig.className}`}
                >
                  {buttonConfig.icon}
                  {buttonConfig.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showStudentStats && doneQuizzes > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
          <span>
            Đã pass:{' '}
            <span className="font-bold text-emerald-600">
              {passedQuizzes}/{totalQuizzes}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default QuizProgressCard;