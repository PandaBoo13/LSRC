// src/pages/elearning/AdminPages/AdminCoursePreviewPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
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
  FaUserTie,
} from 'react-icons/fa';

// Shell & Layout
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { adminNav } from '../../../data/elearning';

// Services
import { getCourseById, updateCourseStatus } from '../../../service/courseService';
import { getChaptersByCourse } from '../../../service/chapterService';
import { getResourcesByCourse } from '../../../service/courseResourceService';
import { getImageUrl } from '../../../utils/imageHelper';

// Types
import type { Course } from '../../../types/course.types';
import type { Chapter } from '../../../types/chapter.types';
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

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  DRAFT: {
    label: 'Bản nháp',
    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  PENDING_REVIEW: {
    label: 'Chờ duyệt',
    badgeClass: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    dotClass: 'bg-blue-500 animate-pulse',
  },
  PUBLISHED: {
    label: 'Đã xuất bản',
    badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    dotClass: 'bg-emerald-500',
  },
  ARCHIVED: {
    label: 'Đã lưu trữ',
    badgeClass: 'bg-red-50 text-red-500 border border-red-200/60',
    dotClass: 'bg-red-500',
  },
};

export const AdminCoursePreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]); // ✅ Thêm state resources
  const [quizzes, setQuizzes] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'quizzes'>('overview');

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);

    const results = await Promise.allSettled([
      getCourseById(courseId),
      getChaptersByCourse(courseId),
      getResourcesByCourse(courseId),
    ]);

    if (results[0].status === 'fulfilled') setCourse(results[0].value);
    if (results[1].status === 'fulfilled') setChapters(Array.isArray(results[1].value) ? results[1].value : []);
    if (results[2].status === 'fulfilled') {
      const allResources = Array.isArray(results[2].value) ? results[2].value : [];
      setResources(allResources); // ✅ Lưu tất cả resources
      setQuizzes(allResources.filter(r => r.resourceType === 'QUIZ'));
    }

    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleReject = async () => {
    if (!courseId) return;
    const reason = window.prompt('Nhập lý do từ chối (tùy chọn):');
    if (reason === null) return;

    setRejecting(true);
    try {
      await updateCourseStatus(courseId, { status: 'DRAFT' });
      alert(reason ? `Đã từ chối khóa học. Lý do: "${reason}"` : 'Đã từ chối khóa học, trả về trạng thái Nháp.');
      fetchData();
    } catch (error: any) {
      alert('Không thể từ chối khóa học');
    } finally {
      setRejecting(false);
    }
  };

  // ✅ Sửa: Tính từ resources thay vì chapters
  const lessonResources = resources.filter(r => r.resourceType !== 'QUIZ');
  const totalLessons = lessonResources.length;
  
  const totalDuration = lessonResources.reduce((sum, r) => sum + (r.duration || 0), 0);

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
      <DashboardShell role="Admin" title="Kiểm duyệt khóa học" subtitle="Đang tải dữ liệu..." navItems={adminNav}>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#49BBBD] animate-spin" />
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Đang tải dữ liệu khóa học...</p>
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell role="Admin" title="Không tìm thấy" subtitle="Khóa học không tồn tại" navItems={adminNav}>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-2xs max-w-md mx-auto my-12 p-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle size={28} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D] mb-1">Khóa học không tồn tại</h3>
          <p className="text-xs text-slate-500 mb-6">Nội dung này có thể đã bị xóa hoặc liên kết không chính xác.</p>
          <Link
            to="/admin/courses"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#49BBBD] text-white text-xs font-bold hover:bg-[#3da8aa] shadow-xs active:scale-95 transition"
          >
            Quay lại danh sách khóa học
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const statusConfig = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;
  const isPendingReview = course.status === 'PENDING_REVIEW';

  const tabList = [
    { key: 'overview' as const, label: 'Tổng quan', icon: <FaInfoCircle size={14} />, badge: null },
    { key: 'curriculum' as const, label: 'Chương trình học', icon: <FaBookOpen size={14} />, badge: `${totalLessons} bài` },
    { key: 'quizzes' as const, label: 'Quiz', icon: <FaClipboardList size={14} />, badge: `${quizzes.length}` },
  ];

  return (
    <DashboardShell
      role="Admin"
      title="Kiểm duyệt khóa học"
      subtitle="Xem trước nội dung trước khi phê duyệt hoặc từ chối"
      navItems={adminNav}
    >
      <div className="w-full space-y-6 min-w-0 overflow-x-hidden pb-12">
        {/* TOP BAR */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sticky top-0 z-20">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#49BBBD] hover:bg-slate-50 transition group cursor-pointer self-start"
          >
            <FaArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách khóa học</span>
          </Link>

          <div className="flex items-center justify-end gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider ${statusConfig.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
              {statusConfig.label}
            </span>

            {isPendingReview && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs shadow-emerald-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {approving ? (
                    <><FaSpinner className="animate-spin" size={12} /> Đang duyệt...</>
                  ) : (
                    <><FaCheckCircle size={12} /> Phê duyệt & Xuất bản</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={approving || rejecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs shadow-red-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {rejecting ? (
                    <><FaSpinner className="animate-spin" size={12} /> Đang xử lý...</>
                  ) : (
                    <><FaTimesCircle size={12} /> Từ chối</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BANNER */}
        <CoursePreviewBanner
          thumbnail={thumbnail}
          title={course.title}
          description={course.description}
          instructorName={
            `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() ||
            'Chưa gán giảng viên'
          }
          metaItems={[
            { icon: <FaClock size={12} />, text: formatDuration(totalDuration) },
            { icon: <FaLayerGroup size={12} />, text: `${chapters.length} chương · ${totalLessons} bài học` },
            { icon: <FaPenAlt size={12} />, text: `${quizzes.length} quiz` },
            { icon: <FaGlobe size={12} />, text: LANGUAGES[course.language || 'vi'] || 'Tiếng Việt' },
            { icon: <FaSignal size={12} />, text: LEVELS[course.level || ''] || 'Mọi trình độ' },
            { icon: <FaUserTie size={12} />, text: `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() },
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
          {activeTab === 'curriculum' && <CoursePreviewCurriculum chapters={chapters} resources={lessonResources} />}
          {activeTab === 'quizzes' && <CoursePreviewQuizzes quizzes={quizzes} />}
        </div>
      </div>
    </DashboardShell>
  );
};