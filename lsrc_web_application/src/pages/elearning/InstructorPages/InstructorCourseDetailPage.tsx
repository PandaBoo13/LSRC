// src/pages/elearning/InstructorPages/InstructorCourseDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaBook, 
  FaQuestionCircle,
  FaUsers, 
  FaSpinner, 
  FaEye,
  FaCopy,
  FaDesktop,
  FaPaperPlane,
  FaFileAlt
} from 'react-icons/fa';

// Import Dashboard Shell & Layout
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { instructorNav } from '../../../data/elearning';

// Import các Services
import { getCourseById, cloneCourse, submitCourseReview } from '../../../service/courseService';
import { getStudentsProgressByCourse } from '../../../service/progress/progressService';
import { getImageUrl } from '../../../utils/imageHelper';

// Import các Types
import type { Course } from '../../../types/course.types';
import type { ProgressResponse } from '../../../service/progress/progress.types';

// Import Sub-components
import { StudentProgressChart } from '../../../components/elearning/course/course-details/StudentProgressChart';
import { LessonsTab } from '../../../components/elearning/course/course-details/tabs/LessonsTab';
import { StudentsTab } from '../../../components/elearning/course/course-details/tabs/StudentsTab';
import { QuestionsTab } from '../../../components/elearning/course/course-details/tabs/QuestionsTab';
import { CourseResourcesTab } from '../../../components/elearning/course/course-details/tabs/CourseResourcesTab';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Nháp', className: 'bg-amber-50 text-amber-600' },
  PENDING_REVIEW: { label: 'Chờ duyệt', className: 'bg-blue-50 text-blue-600' },
  PUBLISHED: { label: 'Đã xuất bản', className: 'bg-emerald-50 text-emerald-600' },
  ARCHIVED: { label: 'Đã lưu trữ', className: 'bg-slate-100 text-slate-500' },
};

type TabType = 'lessons' | 'questions' | 'resources' | 'students';

const VALID_TABS: TabType[] = ['lessons', 'questions', 'resources', 'students'];

export const InstructorCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States Dữ liệu
  const [course, setCourse] = useState<Course | null>(null);
  const [studentsProgress, setStudentsProgress] = useState<ProgressResponse[]>([]);

  // States UI
  const [loading, setLoading] = useState<boolean>(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && VALID_TABS.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    return 'lessons';
  });

  // ========== FETCH DỮ LIỆU TỔNG THỂ ==========
  const fetchOverviewData = useCallback(async () => {
    if (!courseId || isNaN(Number(courseId))) return;
    setLoading(true);
    setProgressLoading(true);

    try {
      const [courseData, progressData] = await Promise.all([
        getCourseById(courseId),
        getStudentsProgressByCourse(courseId),
      ]);

      setCourse(courseData);
      setStudentsProgress(Array.isArray(progressData) ? progressData : []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu khóa học:', err);
    } finally {
      setLoading(false);
      setProgressLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // ========== HANDLE TAB CHANGE ==========
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ========== HANDLE CLONE ==========
  const handleClone = async () => {
    if (!courseId) return;
    if (!window.confirm('Nhân bản khóa học này? Một bản sao sẽ được tạo ở trạng thái Nháp.')) return;

    setCloning(true);
    try {
      const cloned = await cloneCourse(courseId);
      navigate(`/instructor/courses/${cloned.id}`);
    } catch (error: any) {
      alert('Không thể nhân bản khóa học');
    } finally {
      setCloning(false);
    }
  };

  // ========== HANDLE SUBMIT REVIEW ==========
  const handleSubmitReview = async () => {
    if (!courseId) return;
    if (!window.confirm('Gửi khóa học này cho Admin kiểm duyệt? Sau khi gửi, bạn sẽ không thể chỉnh sửa cho đến khi được phê duyệt hoặc từ chối.')) return;

    setSubmitting(true);
    try {
      await submitCourseReview(courseId);
      fetchOverviewData();
    } catch (error: any) {
      alert('Không thể gửi kiểm duyệt');
    } finally {
      setSubmitting(false);
    }
  };

  const thumbnail =
    getImageUrl(course?.thumbnailUrl) ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';

  const statusConfig = STATUS_LABELS[course?.status || ''] || STATUS_LABELS.DRAFT;

  if (loading) {
    return (
      <DashboardShell
        role="Instructor"
        title="Chi tiết khóa học"
        subtitle="Đang tải..."
        navItems={instructorNav}
      >
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        role="Instructor"
        title="Không tìm thấy"
        subtitle="Khóa học không tồn tại"
        navItems={instructorNav}
      >
        <div className="text-center py-20 text-slate-400">Khóa học không tồn tại hoặc đã bị xóa</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Instructor"
      title="Chi tiết khóa học"
      subtitle={`Quản lý khóa học "${course.title}"`}
      navItems={instructorNav}
    >
      <div className="w-full space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate('/instructor/courses')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#49BBBD] transition cursor-pointer"
        >
          <FaArrowLeft size={11} /> Quay lại danh sách khóa học
        </button>

        {/* HEADER BANNER */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
            <img
              src={thumbnail}
              alt={course.title}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border border-slate-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md sm:rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
                {course.courseType && (
                  <span className="px-2 py-0.5 rounded-md sm:rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                    {course.courseType}
                  </span>
                )}
                {course.isFree && (
                  <span className="px-2 py-0.5 rounded-md sm:rounded-lg bg-green-50 text-green-600 text-[10px] font-bold shrink-0">
                    Miễn phí
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-[#2F327D] leading-snug break-words line-clamp-2">
                {course.title}
              </h1>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5">ID: #{course.id}</p>
            </div>
          </div>

          {/* BUTTONS GROUP */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {course.status === 'DRAFT' && (
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#49BBBD] hover:bg-[#3da8aa] text-white px-4 py-2.5 text-xs font-bold transition active:scale-[0.98] shrink-0 disabled:opacity-50 shadow-sm"
              >
                {submitting ? (
                  <><FaSpinner className="animate-spin" size={12} /> Đang gửi...</>
                ) : (
                  <><FaPaperPlane size={12} /> Gửi kiểm duyệt</>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleClone}
              disabled={cloning}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2.5 text-xs font-bold text-amber-700 transition active:scale-[0.98] shrink-0 disabled:opacity-50"
            >
              {cloning ? (
                <><FaSpinner className="animate-spin" size={12} /> Đang nhân bản...</>
              ) : (
                <><FaCopy size={12} /> Nhân bản</>
              )}
            </button>

            <Link
              to={`/instructor/courses/${courseId}/preview`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2.5 text-xs font-bold text-indigo-700 transition active:scale-[0.98] shrink-0"
            >
              <FaDesktop size={12} /> Xem trước
            </Link>

            {course.slug && (
              <Link
                to={`/courses/${course.slug}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-[#49BBBD] hover:text-white border border-slate-200 hover:border-[#49BBBD] px-4 py-2.5 text-xs font-bold text-slate-600 transition active:scale-[0.98] shrink-0"
              >
                <FaEye size={12} /> Xem công khai
              </Link>
            )}
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <StudentProgressChart 
            data={studentsProgress} 
            loading={progressLoading}
          />
        </div>

        {/* TABS HEADER */}
        <div className="bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-slate-200/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('lessons')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'lessons' ? 'bg-[#49BBBD] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FaBook size={13} /> Bài học
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('questions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'questions' ? 'bg-[#49BBBD] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FaQuestionCircle size={13} /> Câu hỏi
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('resources')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'resources' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FaFileAlt size={13} /> Tài nguyên
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'students' ? 'bg-[#49BBBD] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FaUsers size={13} /> Học viên
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {studentsProgress.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80">
          <div className={activeTab === 'lessons' ? 'block' : 'hidden'}>
            <LessonsTab courseId={courseId} />
          </div>
          <div className={activeTab === 'questions' ? 'block' : 'hidden'}>
            <QuestionsTab courseId={courseId} />
          </div>
          <div className={activeTab === 'resources' ? 'block' : 'hidden'}>
            <CourseResourcesTab courseId={courseId} />
          </div>
          <div className={activeTab === 'students' ? 'block' : 'hidden'}>
            <StudentsTab courseId={courseId} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};