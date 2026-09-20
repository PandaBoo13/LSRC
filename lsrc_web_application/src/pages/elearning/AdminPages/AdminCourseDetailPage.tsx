import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaUsers, FaSpinner, FaFileAlt, FaDatabase } from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { adminNav } from '../../../data/elearning';
import { getCourseById } from '../../../service/courseService';
import { getStudentsProgressByCourse } from '../../../service/progress/progressService';
import { getResourcesByCourse } from '../../../service/courseResourceService';
import type { Course } from '../../../types/course.types';
import type { CourseResource } from '../../../types/courseResource.types';
import type { ProgressResponse } from '../../../service/progress/progress.types';
import { CourseInfoCard } from '../../../components/elearning/course/CourseInfoCard';
import { Toast } from '../../../components/elearning/ui/Toast';
import type { ToastMessage } from '../../../components/elearning/ui/Toast';

import { StudentProgressChart } from '../../../components/elearning/course/course-details/StudentProgressChart';
import { LessonCompletionChart } from '../../../components/elearning/course/course-details/LessonCompletionChart';
import { LessonsTab } from '../../../components/elearning/course/course-details/tabs/LessonsTab';
import { QuestionsTab } from '../../../components/elearning/course/course-details/tabs/QuestionsTab';
import { StudentsTab } from '../../../components/elearning/course/course-details/tabs/StudentsTab';
import { CourseResourcesTab } from '../../../components/elearning/course/course-details/tabs/CourseResourcesTab';

type TabType = 'lessons' | 'questions' | 'resources' | 'students';
const VALID_TABS: TabType[] = ['lessons', 'questions', 'resources', 'students'];

export const AdminCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [studentsProgress, setStudentsProgress] = useState<ProgressResponse[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // ✅ Khởi tạo activeTab từ URL 1 lần duy nhất
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab');
    return (tabParam && VALID_TABS.includes(tabParam as TabType)) ? (tabParam as TabType) : 'lessons';
  });

  // ✅ Lazy-mount: tab chỉ mount khi user click lần đầu, sau đó giữ nguyên
  const [mountedTabs, setMountedTabs] = useState<Set<TabType>>(
    () => new Set<TabType>([activeTab])
  );

  const fetchOverviewData = useCallback(async () => {
    if (!courseId || isNaN(courseId)) return;
    setLoading(true);
    setProgressLoading(true);

    try {
      const [courseData, progressData, resourcesData] = await Promise.all([
        getCourseById(courseId),
        getStudentsProgressByCourse(courseId),
        getResourcesByCourse(courseId),
      ]);

      setCourse(courseData);
      setStudentsProgress(Array.isArray(progressData) ? progressData : []);

      if (Array.isArray(resourcesData)) {
        setResources(resourcesData);
        setTotalQuizzes(resourcesData.filter(r => r.resourceType === 'QUIZ').length);
        setTotalLessons(resourcesData.filter(r => r.resourceType !== 'QUIZ').length);
      }
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

  /** ✅ Đổi tab: update URL với replace, và đảm bảo tab được mount */
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMountedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
    setSearchParams({ tab }, { replace: true });   // ✅ không push history
  };

  if (loading) {
    return (
      <DashboardShell role="Admin" title="Chi tiết khóa học" subtitle="Đang tải dữ liệu..." navItems={adminNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell role="Admin" title="Không tìm thấy" subtitle="Khóa học không tồn tại" navItems={adminNav}>
        <div className="text-center py-20 text-slate-400 text-sm font-medium">
          Khóa học không tồn tại hoặc đã bị xóa
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Admin"
      title="Chi tiết khóa học"
      subtitle={`Quản lý khóa học "${course.title}"`}
      navItems={adminNav}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="w-full space-y-5">
        {/* Navigation Back */}
        <button
          type="button"
          onClick={() => navigate('/admin/courses')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          <FaArrowLeft size={10} /> Danh sách khóa học
        </button>

        {/* Course Info Header */}
        <CourseInfoCard
          course={course}
          onUpdate={(updated) => setCourse(updated)}
          onToast={(msg, type) => setToast({ message: msg, type })}
        />

        {/* Quick KPI Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
              <FaBook size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 leading-none">{totalLessons}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Bài học</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
              <FaDatabase size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 leading-none">{totalQuizzes}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Bài Quiz</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 font-bold">
              <FaUsers size={16} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 leading-none">{studentsProgress.length}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Học viên</p>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 min-w-0">
            <StudentProgressChart data={studentsProgress} loading={progressLoading} />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <LessonCompletionChart studentsProgress={studentsProgress} loading={progressLoading} />
          </div>
        </div>

        {/* Tab Navigation & Content Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          {/* Compact Tab Header */}
          <div className="border-b border-slate-100 p-2 bg-slate-50/50 flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTabChange('lessons')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'lessons' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FaBook size={12} /> Bài học
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('questions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FaDatabase size={12} /> Ngân hàng câu hỏi
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('resources')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FaFileAlt size={12} /> Tài nguyên
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('students')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'students' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FaUsers size={12} /> Danh sách học viên
            </button>
          </div>

          {/* ✅ Tab panels — lazy mount + giữ mounted, chỉ ẩn bằng CSS */}
          <div className="p-4 sm:p-5">
            {mountedTabs.has('lessons') && (
              <div style={{ display: activeTab === 'lessons' ? 'block' : 'none' }}>
                <LessonsTab courseId={courseId} />
              </div>
            )}
            {mountedTabs.has('questions') && (
              <div style={{ display: activeTab === 'questions' ? 'block' : 'none' }}>
                <QuestionsTab courseId={courseId} />
              </div>
            )}
            {mountedTabs.has('resources') && (
              <div style={{ display: activeTab === 'resources' ? 'block' : 'none' }}>
                <CourseResourcesTab courseId={courseId} />
              </div>
            )}
            {mountedTabs.has('students') && (
              <div style={{ display: activeTab === 'students' ? 'block' : 'none' }}>
                <StudentsTab courseId={courseId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};