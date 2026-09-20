// ============================================================
// src/pages/elearning/StudentPages/StudentDashboardPage.tsx
// ============================================================
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAward, FaBookOpen, FaChevronRight, FaClock, FaQuestionCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { MetricCard, ProgressBar } from '../../../components/elearning';
import { DashboardCourseCard } from '../../../components/elearning/enrollment/DashboardCourseCard'; // ✅ THÊM
import { studentNav } from '../../../data/elearning';
import { getEnrolledCourses } from '../../../service/orderService';
import { getMyProgress } from '../../../service/progress/progressService';
import type { OrderItemResponse } from '../../../types/order.types';
import type { ProgressResponse } from '../../../service/progress/progress.types';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [enrollments, setEnrollments] = useState<OrderItemResponse[]>([]);
  const [progresses, setProgresses] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [enrollData, progressData] = await Promise.all([
          getEnrolledCourses(),
          getMyProgress().catch(() => []),
        ]);

        setEnrollments(Array.isArray(enrollData) ? enrollData : []);
        const validProgresses = Array.isArray(progressData) ? progressData : [];
        setProgresses(validProgresses);
        setTotalTimeSpent(
          validProgresses.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0)
        );
      } catch (err: any) {
        console.error('Failed to fetch dashboard:', err);
        setError(err?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ==================== DERIVED DATA ====================
  const activeCourses = enrollments.filter(e => e.status === 'ACTIVE').length;
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
  const hoursLearned = Math.floor(totalTimeSpent / 3600);
  const avgProgress = progresses.length > 0
    ? Math.round(
        progresses.reduce((sum, p) => sum + (Number(p.progressPercentage) || 0), 0) / progresses.length
      )
    : 0;

  // ==================== ENRICH ENROLLMENTS ====================
  const enrichedEnrollments = enrollments.map(enrollment => {
    const progress = progresses.find(p => p.courseId === enrollment.courseId);
    return {
      ...enrollment,
      progress: Number(progress?.progressPercentage) || Number(enrollment.progress) || 0,
    };
  });

  // ==================== HANDLERS ====================
  const handleViewProgress = (e: React.MouseEvent, enrollment: OrderItemResponse) => {
    e.stopPropagation();
    navigate(`/my-progress/${enrollment.courseId}`);
  };

  const handleStartLearning = (e: React.MouseEvent, enrollment: OrderItemResponse) => {
    e.stopPropagation();
    navigate(`/my-progress/${enrollment.courseId}`);
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <DashboardShell role="Student" title="Bảng điều khiển" subtitle="Đang tải..." navItems={studentNav} user={user ?? undefined}>
        <div className="flex justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
        </div>
      </DashboardShell>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <DashboardShell role="Student" title="Lỗi" subtitle="" navItems={studentNav} user={user ?? undefined}>
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition"
          >
            Thử lại
          </button>
        </div>
      </DashboardShell>
    );
  }

  // ==================== MAIN ====================
  return (
    <DashboardShell
      role="Student"
      title="Bảng điều khiển"
      subtitle="Theo dõi tiến độ và tiếp tục học tập."
      navItems={studentNav}
      user={user ?? undefined}
    >
      {/* ==================== STATS ==================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Khóa học đang học"
          value={String(activeCourses)}
          note={`${completedCourses} đã hoàn thành`}
          icon={<FaBookOpen />}
          accent="bg-cyan-50 text-cyan-600"
        />
        <MetricCard
          label="Giờ đã học"
          value={String(hoursLearned)}
          note={totalTimeSpent % 3600 > 0 ? `+${Math.floor((totalTimeSpent % 3600) / 60)} phút` : ''}
          icon={<FaClock />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Tiến độ TB"
          value={`${avgProgress}%`}
          note={`${progresses.length} khóa học`}
          icon={<FaQuestionCircle />}
          accent="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Chứng chỉ"
          value="0"
          note="Hoàn thành khóa học để nhận"
          icon={<FaAward />}
          accent="bg-violet-50 text-violet-600"
        />
      </section>

      {/* ==================== CONTENT ==================== */}
      <section className="mt-10 grid gap-8 xl:grid-cols-[1.7fr_0.9fr]">
        {/* LEFT: Tiếp tục học - DÙNG EnrollmentCard */}
        <Panel className="border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Tiếp tục học</h2>
              <p className="mt-1 text-sm text-slate-500">Tiếp tục các khóa học của bạn.</p>
            </div>
            <Link
              to="/my-courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
            >
              Xem tất cả <FaChevronRight size={12} />
            </Link>
          </div>

<div className="mt-8 space-y-5">
  {enrichedEnrollments.slice(0, 3).length > 0 ? (
    enrichedEnrollments.slice(0, 3).map((enrollment) => (
      <DashboardCourseCard
        key={enrollment.id}
        enrollment={enrollment}
        onStartLearning={(e) => {
          e.stopPropagation();
          navigate(`/my-progress/${enrollment.courseId}`);
        }}
      />
    ))
  ) : (
    <div className="text-center py-8 text-slate-400">
      <p>Chưa đăng ký khóa học nào</p>
      <Link to="/courses" className="text-cyan-500 hover:underline mt-2 inline-block">
        Khám phá khóa học
      </Link>
    </div>
  )}
</div>
        </Panel>

        {/* RIGHT: Hoạt động gần đây */}
        <Panel className="border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Hoạt động gần đây</h2>
            <p className="mt-1 text-sm text-slate-500">Tiến độ học tập của bạn.</p>
          </div>

          <div className="mt-8 space-y-4">
            {progresses.slice(0, 5).length > 0 ? (
              progresses.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/my-progress/${p.courseId}`)}
                  className="w-full text-left rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-cyan-200 hover:bg-cyan-50/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">
                      {p.courseTitle || `Khóa học #${p.courseId}`}
                    </h3>
                    <span className="text-sm font-semibold text-cyan-600">
                      {Math.round(Number(p.progressPercentage) || 0)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={Number(p.progressPercentage) || 0} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {p.completedItems || 0}/{p.totalItems || 0} mục •{' '}
                    {Math.floor((p.totalTimeSpent || 0) / 60)} phút học
                  </p>
                </button>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>

          {/* Tổng thể */}
          <div className="mt-8 rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-500 p-6 text-white">
            <p className="text-sm font-medium text-cyan-100">Tiến độ tổng thể</p>
            <h3 className="mt-2 text-3xl font-bold">{avgProgress}%</h3>
            <p className="mt-2 text-sm text-cyan-100">
              Bạn đã hoàn thành {completedCourses}/{enrollments.length} khóa học.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </Panel>
      </section>
    </DashboardShell>
  );
}