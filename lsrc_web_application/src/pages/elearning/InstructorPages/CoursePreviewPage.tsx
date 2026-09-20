// src/pages/elearning/InstructorPages/CoursePreviewPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaClock,
  FaLayerGroup,
  FaPenAlt,
  FaSignal,
  FaGlobe,
  FaBookOpen,
  FaClipboardList,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';

// Shell & Layout
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { instructorNav } from '../../../data/elearning';

// Services
import { getCourseById, updateCourseStatus } from '../../../service/courseService';
import { getChaptersByCourse } from '../../../service/chapterService';
// ✅ THAY ĐỔI: Bỏ quizService, dùng courseResourceService
import { getResourcesByCourse } from '../../../service/courseResourceService';
import { getImageUrl } from '../../../utils/imageHelper';

// Types
import type { Course } from '../../../types/course.types';
import type { Chapter } from '../../../types/chapter.types';
// ✅ THAY ĐỔI: Bỏ Quiz type, dùng CourseResource
import type { CourseResource } from '../../../types/courseResource.types';

// Sub-components
import { CoursePreviewBanner } from '../../../components/elearning/course/preview/CoursePreviewBanner';
import { CoursePreviewOverview } from '../../../components/elearning/course/preview/CoursePreviewOverview';
import { CoursePreviewCurriculum } from '../../../components/elearning/course/preview/CoursePreviewCurriculum';
import { CoursePreviewQuizzes } from '../../../components/elearning/course/preview/CoursePreviewQuizzes';

const LANGUAGES: Record<string, string> = {
  vi: '🇻🇳 Tiếng Việt',
  en: '🇬🇧 English',
  ja: '🇯🇵 日本語',
  ko: '🇰🇷 한국어',
  zh: '🇨🇳 中文',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
  es: '🇪🇸 Español',
};

const LEVELS: Record<string, string> = {
  BEGINNER: 'Sơ cấp (Beginner)',
  INTERMEDIATE: 'Trung cấp (Intermediate)',
  ADVANCED: 'Cao cấp (Advanced)',
  ALL_LEVELS: 'Mọi trình độ',
};

export const CoursePreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();

  // States
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // ✅ THAY ĐỔI: quizzes → resources (CourseResource[])
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'quizzes'>('overview');

  const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || '';
  const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

  // ✅ THÊM: Lọc resources theo type
  const quizzes = resources.filter(r => r.resourceType === 'QUIZ');

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);

    const results = await Promise.allSettled([
      getCourseById(courseId),
      getChaptersByCourse(courseId),
      // ✅ THAY ĐỔI: getQuizzesByCourse → getResourcesByCourse
      getResourcesByCourse(courseId),
    ]);

    if (results[0].status === 'fulfilled') setCourse(results[0].value);
    if (results[1].status === 'fulfilled') setChapters(Array.isArray(results[1].value) ? results[1].value : []);
    // ✅ THAY ĐỔI: setQuizzes → setResources
    if (results[2].status === 'fulfilled') {
      const allResources = Array.isArray(results[2].value) ? results[2].value : [];
      setResources(allResources);
    }

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== HANDLE APPROVE ====================
  const handleApprove = async () => {
    if (!courseId) return;
    if (!window.confirm(`Phê duyệt khóa học "${course?.title}" và xuất bản ngay?`)) return;

    setApproving(true);
    try {
      await updateCourseStatus(courseId, { status: 'PUBLISHED' });
      alert('✅ Đã phê duyệt và xuất bản khóa học!');
      fetchData();
    } catch (error: any) {
      alert('Không thể phê duyệt khóa học');
    } finally {
      setApproving(false);
    }
  };

  // ==================== HANDLE REJECT ====================
  const handleReject = async () => {
    if (!courseId) return;
    if (!window.confirm(`Từ chối khóa học "${course?.title}"? Khóa học sẽ trở về trạng thái Nháp.`)) return;

    setRejecting(true);
    try {
      await updateCourseStatus(courseId, { status: 'DRAFT' });
      alert('Đã từ chối khóa học, trả về trạng thái Nháp.');
      fetchData();
    } catch (error: any) {
      alert('Không thể từ chối khóa học');
    } finally {
      setRejecting(false);
    }
  };

  // Calculations
  // ✅ THAY ĐỔI: Tính từ resources thay vì chapters.lessons
  const totalLessons = resources.filter(r => 
    r.resourceType === 'VIDEO' || r.resourceType === 'QUIZ'
  ).length;
  
  // ✅ THAY ĐỔI: Tính totalDuration từ resources
  const totalDuration = resources.reduce((sum, r) => sum + (r.duration || 0), 0);

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0 phút';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m > 0 ? `${m} phút` : ''}` : `${m} phút`;
  };

  const thumbnail =
    getImageUrl(course?.thumbnailUrl) ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';

  if (loading) {
    return (
      <DashboardShell
        role={isAdmin ? 'Admin' : 'Instructor'}
        title="Xem trước khóa học"
        subtitle="Đang tải dữ liệu..."
        navItems={instructorNav}
      >
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49BBBD] animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            Đang khởi tạo chế độ xem trước...
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell
        role={isAdmin ? 'Admin' : 'Instructor'}
        title="Không tìm thấy"
        subtitle="Khóa học không tồn tại"
        navItems={instructorNav}
      >
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-2xs max-w-md mx-auto my-12 p-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle size={28} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D] mb-1">Khóa học không tồn tại</h3>
          <p className="text-xs text-slate-500 mb-6">
            Nội dung này có thể đã bị xóa hoặc liên kết truy cập không chính xác.
          </p>
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/admin/courses' : '/instructor/courses')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#49BBBD] text-white text-xs font-bold hover:bg-[#3da8aa] shadow-xs shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </DashboardShell>
    );
  }

  const tabList = [
    { key: 'overview' as const, label: 'Tổng quan', icon: <FaInfoCircle size={14} />, badge: null },
    { key: 'curriculum' as const, label: 'Chương trình học', icon: <FaBookOpen size={14} />, badge: `${totalLessons} bài` },
    // ✅ THAY ĐỔI: quizzes (đã lọc từ resources)
    { key: 'quizzes' as const, label: 'Quiz', icon: <FaClipboardList size={14} />, badge: `${quizzes.length}` },
  ];

  const isPendingReview = course.status === 'PENDING_REVIEW';

  return (
    <DashboardShell
      role={isAdmin ? 'Admin' : 'Instructor'}
      title="Xem trước khóa học"
      subtitle="Góc nhìn thực tế của học viên khi tham gia"
      navItems={instructorNav}
    >
      <div className="w-full space-y-6 min-w-0 overflow-x-hidden pb-12">
        {/* TOP NAVIGATION BAR */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky top-0 z-20 transition-all">
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/admin/courses' : `/instructor/courses/${courseId}`)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#49BBBD] hover:bg-slate-50 transition group cursor-pointer self-start sm:self-auto"
          >
            <FaArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />
            <span>{isAdmin ? 'Quay lại danh sách khóa học' : 'Quay lại trang quản lý'}</span>
          </button>

          <div className="flex items-center justify-end gap-2.5 flex-wrap">
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider ${
              course.status === 'PUBLISHED'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                : course.status === 'PENDING_REVIEW'
                ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                : course.status === 'ARCHIVED'
                ? 'bg-red-50 text-red-500 border border-red-200/60'
                : 'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                course.status === 'PUBLISHED' ? 'bg-emerald-500'
                : course.status === 'PENDING_REVIEW' ? 'bg-blue-500 animate-pulse'
                : course.status === 'ARCHIVED' ? 'bg-red-500'
                : 'bg-amber-500 animate-pulse'
              }`} />
              {course.status === 'DRAFT' ? 'Bản nháp'
                : course.status === 'PENDING_REVIEW' ? 'Chờ duyệt'
                : course.status === 'PUBLISHED' ? 'Đã xuất bản'
                : course.status}
            </span>

            {/* NÚT KIỂM DUYỆT CHO ADMIN */}
            {isAdmin && isPendingReview && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs shadow-emerald-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {approving ? <><FaSpinner className="animate-spin" size={12} /> Đang duyệt...</> : <><FaCheckCircle size={12} /> Phê duyệt</>}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={approving || rejecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs shadow-red-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {rejecting ? <><FaSpinner className="animate-spin" size={12} /> Đang xử lý...</> : <><FaTimesCircle size={12} /> Từ chối</>}
                </button>
              </>
            )}

            {/* Edit Button - chỉ cho Instructor */}
            {!isAdmin && (
              <button
                type="button"
                onClick={() => navigate(`/instructor/courses/${courseId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#49BBBD] text-white text-xs font-bold hover:bg-[#3da8aa] shadow-xs shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
              >
                <FaEdit size={12} /> Chỉnh sửa khóa học
              </button>
            )}
          </div>
        </div>

        {/* BANNER */}
        <CoursePreviewBanner
          thumbnail={thumbnail}
          title={course.title}
          description={course.description}
          instructorName={
            `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() || 'Chưa gán giảng viên'
          }
          metaItems={[
            { icon: <FaClock size={12} />, text: formatDuration(totalDuration) },
            { icon: <FaLayerGroup size={12} />, text: `${chapters.length} chương · ${totalLessons} bài học` },
            // ✅ THAY ĐỔI: quizzes.length (đã lọc từ resources)
            { icon: <FaPenAlt size={12} />, text: `${quizzes.length} quiz` },
            { icon: <FaGlobe size={12} />, text: LANGUAGES[course.language || 'vi'] || 'Tiếng Việt' },
            { icon: <FaSignal size={12} />, text: LEVELS[course.level || ''] || 'Mọi trình độ' },
          ]}
          price={course.price}
          oldPrice={course.oldPrice}
          isFree={course.isFree}
          averageRating={course.averageRating}
          totalStudents={course.totalStudents}
        />

        {/* TABS */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 inline-flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {tabList.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-white text-[#2F327D] shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <span className={isActive ? 'text-[#49BBBD]' : 'text-slate-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors ${
                    isActive ? 'bg-cyan-50 text-[#49BBBD]' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs min-h-[350px]">
          {activeTab === 'overview' && <CoursePreviewOverview course={course} />}
          {/* ✅ THAY ĐỔI: Truyền thêm resources vào CoursePreviewCurriculum */}
          {activeTab === 'curriculum' && <CoursePreviewCurriculum chapters={chapters} resources={resources} />}
          {/* ✅ THAY ĐỔI: quizzes (đã lọc từ resources) */}
          {activeTab === 'quizzes' && <CoursePreviewQuizzes quizzes={quizzes} />}
        </div>
      </div>
    </DashboardShell>
  );
};