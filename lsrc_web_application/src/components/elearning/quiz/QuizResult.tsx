// ============================================
// src/components/elearning/quiz/QuizResult.tsx
// ============================================
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';
import type { QuizAttempt } from '../../../service/quiz/quiz.types';

type Props = {
  result: QuizAttempt;
  onRetry?: () => void;
  onBackToCourses?: () => void;
  onGoBack?: () => void;
};

export function QuizResult({ result, onRetry, onBackToCourses, onGoBack }: Props) {
  const percentage = result.maxScore > 0
    ? Math.round((result.score / result.maxScore) * 100)
    : 0;

  // ✅ FIX: fallback 80 nếu passingScore undefined
  const passingScore = result.passingScore ?? 80;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center py-8">
      {/* Icon */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
        result.isPassed ? 'bg-emerald-100' : 'bg-rose-100'
      }`}>
        {result.isPassed ? (
          <FaCheckCircle className="text-5xl text-emerald-500" />
        ) : (
          <FaTimesCircle className="text-5xl text-rose-500" />
        )}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        {result.isPassed ? '🎉 Chúc mừng! Bạn đã vượt qua!' : '😢 Chưa đạt yêu cầu'}
      </h2>
      <p className="text-slate-500 mb-6">
        {result.isPassed
          ? 'Bạn đã hoàn thành bài kiểm tra xuất sắc!'
          : 'Cố gắng thêm ở lần sau nhé!'}
      </p>

      {/* Score Card */}
      <div className="bg-slate-50 rounded-2xl p-6 mb-6">
        <div className={`text-5xl font-bold mb-2 ${
          result.isPassed ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {percentage}%
        </div>
        <p className="text-slate-600 font-medium text-lg">
          {result.score}/{result.maxScore} điểm
        </p>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400 flex-wrap">
          <span className="px-2 py-1 bg-white rounded-lg">
            Điểm đạt: <strong className="text-slate-600">{passingScore}%</strong>
          </span>
          <span className="px-2 py-1 bg-white rounded-lg">
            Thời gian: <strong className="text-slate-600">{formatTime(result.timeSpent || 0)}</strong>
          </span>
          <span className="px-2 py-1 bg-white rounded-lg">
            Lần thử: <strong className="text-slate-600">#{result.attemptNumber}</strong>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 max-w-sm mx-auto">
        {onBackToCourses && (
          <button
            onClick={onBackToCourses}
            className="w-full bg-[#49BBBD] text-white py-3 rounded-xl font-semibold hover:bg-[#3fa2a4] transition flex items-center justify-center gap-2"
          >
            <FaArrowLeft size={14} /> Tiếp tục học
          </button>
        )}

        {onRetry && !result.isPassed && (
          <button
            onClick={onRetry}
            className="w-full border border-amber-400 text-amber-600 py-3 rounded-xl font-semibold hover:bg-amber-50 transition flex items-center justify-center gap-2"
          >
            <FaRedo size={14} /> Làm lại
          </button>
        )}

        {onGoBack && (
          <button
            onClick={onGoBack}
            className="w-full border border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            Quay lại
          </button>
        )}
      </div>
    </div>
  );
}