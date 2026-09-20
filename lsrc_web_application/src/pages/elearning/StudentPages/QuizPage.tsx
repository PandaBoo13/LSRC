// ============================================
// src/pages/elearning/StudentPages/QuizPage.tsx
// ============================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaSpinner,
  FaArrowLeft,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
  FaEye,
} from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { StatusPill } from '../../../components/elearning/ui/StatusPill';
import { QuizQuestion } from '../../../components/elearning/quiz/QuizQuestion';
import { QuizSummary } from '../../../components/elearning/quiz/QuizSummary';
import { QuizResult } from '../../../components/elearning/quiz/QuizResult';
import { QuizIntro } from '../../../components/elearning/quiz/QuizIntro';
import { QuizHistory } from '../../../components/elearning/quiz/QuizHistory';
import { studentNav } from '../../../data/elearning';
import { useAuth } from '../../../context/AuthContext';

import {
  getQuizById,
  startAttempt,
  submitAttempt,
  saveAnswers,
  getMyAttempts,
  getQuestionsByQuiz,
  getAttemptsByQuiz,
} from '../../../service/quiz/quizService';

import type {
  Quiz,
  QuizAttempt,
  QuizQuestionItem,
  QuizOptionItem,
} from '../../../service/quiz/quiz.types';

// ==================== HELPER ====================
function normalizeOptions(raw: any): QuizOptionItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(
      (o: any) => o && typeof o.label === 'string' && typeof o.content === 'string'
    );
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter(
            (o: any) =>
              o && typeof o.label === 'string' && typeof o.content === 'string'
          )
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function QuizPage() {
  const { quizId, courseId: courseIdFromParams } = useParams<{
    quizId: string;
    courseId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // ==================== MODE DETECTION ====================
  const studentIdParam = searchParams.get('studentId');
  const isViewStudent = !!studentIdParam;
  const viewingStudentId = studentIdParam ? Number(studentIdParam) : null;

  // Normalize role
  const rawRole =
    (user as any)?.role?.roleName ??
    (user as any)?.roleName ??
    (user as any)?.role ??
    '';
  const isPrivileged = ['ADMIN', 'TEACHER', 'INSTRUCTOR'].includes(
    String(rawRole).toUpperCase()
  );

  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState<'intro' | 'history'>('intro');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [isStarted, setIsStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState<QuizAttempt[]>([]);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // ✅ Chế độ xem đề bài (chỉ viewStudent)
  const [showQuestions, setShowQuestions] = useState(false);

  // ==================== LOAD QUIZ ====================
  useEffect(() => {
    if (!quizId || authLoading) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const quizData = await getQuizById(Number(quizId));
        setQuiz(quizData);
        setQuestionCount(quizData.totalQuestions || 0);

        // ==================== VIEW STUDENT MODE ====================
        if (isViewStudent && isPrivileged && viewingStudentId) {
          // Lấy TẤT CẢ attempt của quiz rồi lọc theo studentId
          const allAttempts = await getAttemptsByQuiz(Number(quizId))
            .catch(() => [] as QuizAttempt[]);

          const studentAttempts = allAttempts.filter(
            (a) => a.accountId === viewingStudentId
          );

          // Sắp xếp mới nhất trước
          studentAttempts.sort(
            (a, b) => (b.attemptNumber ?? 0) - (a.attemptNumber ?? 0)
          );

          setAttemptHistory(studentAttempts);
          setAttemptsUsed(studentAttempts.length);
          return;
        }

        // ==================== SELF MODE ====================
        try {
          const myAttempts = await getMyAttempts(Number(quizId));
          setAttemptHistory(myAttempts);
          setAttemptsUsed(myAttempts.length);
        } catch {
          setAttemptHistory([]);
          setAttemptsUsed(0);
        }
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Không thể tải bài kiểm tra'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, isViewStudent, viewingStudentId, isPrivileged, authLoading]);

  // ==================== FETCH QUESTIONS KHI BẤM XEM ĐỀ ====================
  useEffect(() => {
    if (!showQuestions || !quizId) return;
    if (questions.length > 0) return; // đã có rồi

    (async () => {
      try {
        const raw = await getQuestionsByQuiz(Number(quizId));
        const normalized: QuizQuestionItem[] = raw.map((q: any) => ({
          questionId: q.id,
          content: q.content,
          questionType: q.questionType,
          options: normalizeOptions(q.options),
          points: q.points,
        }));
        setQuestions(normalized);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Không thể tải câu hỏi');
      }
    })();
  }, [showQuestions, quizId, questions.length]);

  // ==================== BẮT ĐẦU LÀM BÀI ====================
  const handleStartQuiz = async () => {
    if (!quizId || isViewStudent) return;

    setLoading(true);
    try {
      const attemptData = await startAttempt(Number(quizId));
      setAttempt(attemptData);

      if (attemptData.questions && attemptData.questions.length > 0) {
        const normalized = attemptData.questions.map((q) => ({
          ...q,
          options: normalizeOptions(q.options),
        }));
        setQuestions(normalized);
        setQuestionCount(normalized.length);
      } else {
        setQuestions([]);
        setQuestionCount(0);
      }

      if (quiz?.timeLimit) {
        setTimeLeft(quiz.timeLimit * 60);
      }

      setHasAutoSubmitted(false);
      setIsStarted(true);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(
        err?.response?.data?.message || err.message || 'Không thể bắt đầu quiz'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== TIMER ====================
  useEffect(() => {
    if (isViewStudent) return;
    if (!isStarted || showResult) return;
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, showResult, isViewStudent, timeLeft === null]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (
    questionId: number,
    option: string,
    questionType: string
  ) => {
    if (isViewStudent) return;

    setAnswers((prev) => {
      if (questionType === 'MULTIPLE_CHOICE') {
        const cur = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: cur.includes(option)
            ? cur.filter((o) => o !== option)
            : [...cur, option],
        };
      }
      return { ...prev, [questionId]: [option] };
    });
  };

  const handleSubmit = useCallback(async () => {
    if (isViewStudent) return;
    if (submitting || !attempt || !quiz) return;

    setSubmitting(true);
    try {
      const answersJson = JSON.stringify(
        Object.entries(answers).map(([questionId, selectedOptions]) => ({
          questionId: Number(questionId),
          selectedOptions,
        }))
      );

      await saveAnswers(attempt.attemptId, { answers: answersJson });
      const resultData = await submitAttempt(attempt.attemptId);

      setResult(resultData);
      setShowResult(true);
      setTimeLeft(null);
    } catch (err: any) {
      console.error('Submit failed:', err);
      setError(err?.response?.data?.message || 'Nộp bài không thành công');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, attempt, quiz, answers, isViewStudent]);

  // Auto submit
  useEffect(() => {
    if (isViewStudent) return;
    if (
      timeLeft === 0 &&
      isStarted &&
      !showResult &&
      !submitting &&
      !hasAutoSubmitted
    ) {
      setHasAutoSubmitted(true);
      handleSubmit();
    }
  }, [timeLeft, isStarted, showResult, submitting, handleSubmit, isViewStudent, hasAutoSubmitted]);

  const handleRetry = () => {
    setAttempt(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setShowResult(false);
    setIsStarted(false);
    setTimeLeft(null);
    setHasAutoSubmitted(false);

    if (quizId && !isViewStudent) {
      getMyAttempts(Number(quizId))
        .then((attempts) => {
          setAttemptHistory(attempts);
          setAttemptsUsed(attempts.length);
        })
        .catch(() => {});
    }
  };

  const handleBackToCourses = () => navigate('/my-courses');
  const handleGoBack = () => navigate(-1);

  // ==================== LOADING ====================
  if (loading || authLoading) {
    return (
      <DashboardShell role="Student" title="Đang tải..." subtitle="" navItems={studentNav}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center animate-bounce">
            <FaSpinner className="animate-spin text-2xl" />
          </div>
          <p className="text-xs font-bold text-slate-400">
            Đang khởi tạo dữ liệu bài kiểm tra...
          </p>
        </div>
      </DashboardShell>
    );
  }

  // ==================== ERROR ====================
  if (error || !quiz) {
    return (
      <DashboardShell role="Student" title="Lỗi" subtitle="" navItems={studentNav}>
        <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <FaExclamationTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Không thể truy cập Quiz
            </h3>
            <p className="text-xs text-rose-500 font-medium mt-1">
              {error || 'Bài kiểm tra không tồn tại hoặc đã bị ẩn'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Quay lại trang trước
          </button>
        </div>
      </DashboardShell>
    );
  }

  // ==================== VIEW STUDENT: XEM ĐỀ BÀI ====================
  if (isViewStudent && showQuestions) {
    return (
      <DashboardShell
        role="Student"
        title="Xem đề bài"
        subtitle=""
        navItems={studentNav}
      >
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={() => setShowQuestions(false)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <FaArrowLeft size={10} /> Quay lại
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-[11px] font-extrabold uppercase tracking-wider">
              <FaEye size={11} /> Xem đề bài — Không thể tương tác
            </span>
          </div>

          <Panel className="rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm bg-white space-y-6">
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">
                {quiz.title || 'Bài kiểm tra'}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <FaInfoCircle size={10} /> {questions.length} câu hỏi
                </span>
                {quiz.timeLimit != null && (
                  <span className="inline-flex items-center gap-1">
                    <FaClock size={10} /> {quiz.timeLimit} phút
                  </span>
                )}
                {quiz.passingScore != null && (
                  <span>Điểm đạt: {quiz.passingScore}%</span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2" />
                  <p className="text-sm">Đang tải câu hỏi...</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <QuizQuestion
                    key={q.questionId}
                    question={{
                      id: q.questionId,
                      content: q.content,
                      questionType: q.questionType,
                      options: q.options ?? [],
                    }}
                    index={i}
                    selectedAnswers={[]}
                    onAnswerChange={() => {}}
                  />
                ))
              )}
            </div>
          </Panel>
        </div>
      </DashboardShell>
    );
  }

  // ==================== KẾT QUẢ ====================
  if (showResult && result) {
    return (
      <DashboardShell role="Student" title="Kết quả bài làm" subtitle="" navItems={studentNav}>
        <Panel className="max-w-2xl mx-auto rounded-3xl p-6 border border-slate-100 shadow-xl">
          <QuizResult
            result={result}
            onRetry={handleRetry}
            onBackToCourses={handleBackToCourses}
            onGoBack={handleGoBack}
          />
        </Panel>
      </DashboardShell>
    );
  }

  // ==================== INTRO + HISTORY (đây là view chính cho viewStudent) ====================
  if (!isStarted) {
    const headerTitle = isViewStudent
      ? `Bài kiểm tra của học viên #${viewingStudentId}`
      : 'Bài kiểm tra';

    return (
      <DashboardShell role="Student" title={headerTitle} subtitle="" navItems={studentNav}>
        <div className="max-w-3xl mx-auto pb-10 space-y-4">
          {/* Banner cho teacher */}
          {isViewStudent && (
            <div className="flex items-start gap-2 rounded-2xl bg-cyan-50 border border-cyan-200 p-4 text-xs text-cyan-800">
              <FaInfoCircle className="mt-0.5 shrink-0" size={13} />
              <p>
                Bạn đang xem <strong>bài kiểm tra này như học viên thấy</strong>.
                Bao gồm thông tin đề, lịch sử làm bài của học viên. Không có lượt
                làm bài nào bị tạo trong chế độ này.
              </p>
            </div>
          )}

          {/* TAB HEADER */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('intro')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'intro'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FaInfoCircle size={13} /> Giới thiệu & Quy thế
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FaHistory size={13} /> Lịch sử làm bài
              {attemptHistory.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'history'
                      ? 'bg-teal-50 text-teal-600'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {attemptHistory.length}
                </span>
              )}
            </button>
          </div>

          <Panel className="rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm bg-white">
            {activeTab === 'intro' ? (
              <>
                <QuizIntro
                  quiz={quiz}
                  questionCount={questionCount}
                  attemptsUsed={attemptsUsed}
                  onStart={() => {
                    // ✅ Nếu là viewStudent → chuyển sang xem đề bài
                    if (isViewStudent) {
                      setShowQuestions(true);
                    } else {
                      handleStartQuiz();
                    }
                  }}
                  onGoBack={handleGoBack}
                />

                {/* Ghi đè nút "Bắt đầu làm bài" khi là viewStudent */}
                {isViewStudent && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500 italic">
                      Bạn đang xem với vai trò giảng viên — bấm "Xem đề bài" phía
                      trên để xem nội dung câu hỏi như học viên thấy.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <QuizHistory
                attempts={attemptHistory}
                onRetry={() => setActiveTab('intro')}
              />
            )}
          </Panel>
        </div>
      </DashboardShell>
    );
  }

  // ==================== EXAM VIEW (STUDENT) ====================
  return (
    <DashboardShell role="Student" title="Đang làm bài..." subtitle="" navItems={studentNav}>
      <div className="max-w-6xl mx-auto space-y-4">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <FaArrowLeft size={10} /> Trở về danh sách
        </button>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Panel className="rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {quiz.title || 'Bài làm Quiz'}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Chọn câu trả lời chính xác cho từng câu hỏi bên dưới.
                </p>
              </div>

              {timeLeft !== null && (
                <StatusPill tone={timeLeft < 60 ? 'rose' : 'amber'}>
                  <span className="flex items-center gap-1.5 font-mono font-bold text-xs">
                    <FaClock
                      className={timeLeft < 60 ? 'animate-pulse' : ''}
                      size={12}
                    />
                    {formatTime(timeLeft)}
                  </span>
                </StatusPill>
              )}
            </div>

            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">Quiz chưa có câu hỏi nào.</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <QuizQuestion
                    key={q.questionId}
                    question={{
                      id: q.questionId,
                      content: q.content,
                      questionType: q.questionType,
                      options: q.options ?? [],
                    }}
                    index={i}
                    selectedAnswers={answers[q.questionId] || []}
                    onAnswerChange={handleAnswerChange}
                  />
                ))
              )}
            </div>
          </Panel>

          <div className="space-y-4">
            <QuizSummary
              totalQuestions={questions.length}
              answeredCount={Object.keys(answers).length}
              passingScore={Number(quiz.passingScore) || 80}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default QuizPage;