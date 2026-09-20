// ============================================================
// src/pages/elearning/StudentPages/QuizResultPage.tsx
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSpinner, FaRedo, FaClock } from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { ProgressBar } from '../../../components/elearning/progress/ProgressBar';
import { studentNav } from '../../../data/elearning';
import type { QuizAttempt } from '../../../service/quiz/quiz.types'; // ✅ Import từ service mới

interface LocationState {
  attemptId?: number;
  score?: number;
  maxScore?: number;
  passingScore?: number;
  isPassed?: boolean;
  status?: string;
  timeSpent?: number;
  attemptNumber?: number;
}

export function QuizResultPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Lấy dữ liệu từ navigation state
    const state = window.history.state?.usr as LocationState | null;
    if (state) {
      setResult(state);
    }
    setLoading(false);
  }, [quizId]);

  // ==================== DERIVED DATA ====================
  const score = result?.score ?? 0;
  const maxScore = result?.maxScore ?? 0;
  const passingScore = result?.passingScore ?? 80;
  const isPassed = result?.isPassed ?? false;
  const timeSpent = result?.timeSpent ?? 0;
  const attemptNumber = result?.attemptNumber ?? 1;

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const getScoreColor = () => isPassed ? 'text-emerald-500' : 'text-red-500';
  const getScoreBg = () => isPassed ? 'bg-emerald-50' : 'bg-red-50';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <DashboardShell role="Student" title="Đang tải..." subtitle="" navItems={studentNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
        </div>
      </DashboardShell>
    );
  }

  // ==================== NO RESULT ====================
  if (!result) {
    return (
      <DashboardShell role="Student" title="Không tìm thấy kết quả" subtitle="" navItems={studentNav}>
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">Không có dữ liệu kết quả</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition"
          >
            Về khóa học
          </button>
        </div>
      </DashboardShell>
    );
  }

  // ==================== MAIN ====================
  return (
    <DashboardShell role="Student" title="Kết quả bài kiểm tra" subtitle="" navItems={studentNav}>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <FaArrowLeft size={12} /> Quay lại
      </button>

      <div className="max-w-md mx-auto">
        <Panel className="text-center p-8">
          {/* Icon */}
          <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full text-5xl ${getScoreBg()} ${getScoreColor()}`}>
            {isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
          </div>

          {/* Title */}
          <h2 className={`mt-6 text-3xl font-bold ${getScoreColor()}`}>
            {isPassed ? 'Chúc mừng! Bạn đã vượt qua!' : 'Chưa đạt yêu cầu'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isPassed
              ? 'Bạn đã hoàn thành bài kiểm tra xuất sắc!'
              : 'Cố gắng thêm ở lần sau nhé!'}
          </p>

          {/* Score Circle */}
          <div className="mt-6">
            <div className="text-5xl font-bold text-slate-900">{percentage}%</div>
            <p className="mt-1 text-sm text-slate-500">
              {score}/{maxScore} điểm
            </p>
          </div>

          {/* Details */}
          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <p className="flex justify-between">
              <span>Điểm đạt</span>
              <strong className="text-slate-900">{passingScore}%</strong>
            </p>
            {timeSpent > 0 && (
              <p className="flex justify-between">
                <span className="flex items-center gap-1">
                  <FaClock size={11} /> Thời gian
                </span>
                <strong className="text-slate-900">{formatTime(timeSpent)}</strong>
              </p>
            )}
            <p className="flex justify-between">
              <span>Lần thử</span>
              <strong className="text-slate-900">#{attemptNumber}</strong>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <ProgressBar
              percentage={percentage}
              size="lg"
              color={isPassed ? 'bg-emerald-500' : 'bg-red-500'}
            />
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            {!isPassed && (
              <button
                onClick={() => navigate(-1)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600 transition"
              >
                <FaRedo size={14} /> Làm lại
              </button>
            )}
            <button
              onClick={() => navigate('/my-courses')}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-600 transition"
            >
              Về khóa học
            </button>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}