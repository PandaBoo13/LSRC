// src/pages/elearning/InstructorPages/StudentProgressPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaCheckCircle, FaPlay, FaClock,
  FaFolder, FaBook,
} from 'react-icons/fa';

import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { StatusBadge } from '../../../components/elearning/progress/StatusBadge';
import { QuizProgressCard } from '../../../components/elearning/course/course-details/QuizProgressCard';
import { instructorNav } from '../../../data/elearning';
import { useAuth } from '../../../context/AuthContext';

import {
  getStudentsProgressByCourse,
  getStudentResourceProgressMapForInstructor,
} from '../../../service/progress/progressService';
import { getResourcesByCourse } from '../../../service/courseResourceService';
import { getChaptersByCourse } from '../../../service/chapterService';
import { getCourseById } from '../../../service/courseService';

import { formatDate, formatTimeSpent } from '../../../utils/progressUtils';

import type { CourseResource } from '../../../types/courseResource.types';
import type { Course } from '../../../types/course.types';
import type { Chapter } from '../../../types/chapter.types';
import type { ProgressResponse } from '../../../service/progress/progress.types';

const getResourceChapterId = (r: CourseResource): number | null => {
  return (r as any)?.chapterId ?? (r as any)?.chapter_id ?? null;
};

const getResourceId = (r: CourseResource): number | null => {
  return (r as any)?.id ?? (r as any)?.idResource ?? null;
};

export const StudentProgressPage: React.FC = () => {
  const { courseId, studentId } = useParams<{ courseId: string; studentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { user } = useAuth();

  // Normalize role
  const rawRole =
    (user as any)?.role?.roleName ??
    (user as any)?.roleName ??
    (user as any)?.role ??
    '';
  const userRole: 'STUDENT' | 'INSTRUCTOR' | 'TEACHER' | 'ADMIN' = [
    'ADMIN', 'TEACHER', 'INSTRUCTOR',
  ].includes(String(rawRole).toUpperCase())
    ? (String(rawRole).toUpperCase() as 'INSTRUCTOR' | 'TEACHER' | 'ADMIN')
    : 'STUDENT';

  const [course, setCourse] = useState<Course | null>(null);
  const [student, setStudent] = useState<ProgressResponse | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [resourceProgressMap, setResourceProgressMap] = useState<
    Record<number, ProgressResponse>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !studentId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const nc = Number(courseId);
        const ns = Number(studentId);

        const [courseData, allStudents, allResources, chaptersData] =
          await Promise.all([
            getCourseById(nc),
            getStudentsProgressByCourse(nc),
            getResourcesByCourse(nc),
            getChaptersByCourse(nc).catch(() => []),
          ]);

        setCourse(courseData);
        const found = allStudents.find((s) => s.accountId === ns) || null;
        setStudent(found);
        setResources(Array.isArray(allResources) ? allResources : []);
        setChapters(Array.isArray(chaptersData) ? chaptersData : []);

        const pmap = await getStudentResourceProgressMapForInstructor(nc, ns)
          .catch(() => ({}));
        setResourceProgressMap(pmap);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, studentId]);

  const getResourceStatus = useCallback(
    (resourceId: number): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' => {
      const status = resourceProgressMap[resourceId]?.status;
      if (status === 'COMPLETED') return 'COMPLETED';
      if (status === 'IN_PROGRESS') return 'IN_PROGRESS';
      return 'NOT_STARTED';
    },
    [resourceProgressMap]
  );

  const resourcesByChapter = (chapterId: number) =>
    resources.filter((r) => getResourceChapterId(r) === chapterId);

  const documentResources = resources.filter((r) =>
    ['PDF', 'SLIDE', 'DOCUMENT', 'AUDIO', 'IMAGE', 'LINK', 'OTHER'].includes(
      r.resourceType || ''
    )
  );

  const standaloneDocuments = documentResources.filter(
    (r) => getResourceChapterId(r) == null
  );

  const backUrl = isAdmin ? '/admin/courses' : '/instructor/courses';

  const completedItems = student?.completedItems ?? 0;
  const totalItems = student?.totalItems ?? resources.length;
  const progressPercentage = Number(student?.progressPercentage) || 0;
  const totalTimeSpent = student?.totalTimeSpent ?? 0;
  const studentStatus = student?.status ?? 'NOT_STARTED';
  const lastAccessedAt = student?.lastAccessedAt;
  const completedAt = student?.completedAt;
  const weightedScore = student?.weightedScore;

  if (loading) {
    return (
      <DashboardShell role="Instructor" title="Đang tải..." subtitle="" navItems={instructorNav}>
        <div className="flex justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="Instructor" title="Lỗi" subtitle="" navItems={instructorNav}>
        <div className="text-center py-20 text-red-500">{error}</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Instructor"
      title={`Tiến độ: ${student?.username || 'Học viên'}`}
      subtitle={course?.title || ''}
      navItems={instructorNav}
    >
      <button
        onClick={() => navigate(`${backUrl}/${courseId}/students`)}
        className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <FaArrowLeft /> Quay lại danh sách học viên
      </button>

      {/* HEADER CARD */}
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow">
                {student?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {student?.username || 'Học viên'}
                </h1>
                <p className="text-sm text-slate-500">{course?.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={studentStatus as any} />
              {lastAccessedAt && (
                <span className="text-sm text-slate-500">
                  Truy cập: {formatDate(lastAccessedAt)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Bài hoàn thành</span>
                <p className="text-lg font-bold text-slate-900">
                  {completedItems} / {totalItems}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Thời gian học</span>
                <p className="text-lg font-bold text-slate-900">
                  {formatTimeSpent(totalTimeSpent)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Điểm trọng số</span>
                <p className="text-lg font-bold text-slate-900">
                  {weightedScore != null ? `${weightedScore}%` : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Hoàn thành</span>
                <p className="text-lg font-bold text-green-600">
                  {completedAt ? formatDate(completedAt) : 'Chưa hoàn thành'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={progressPercentage >= 100 ? '#10B981' : '#49BBBD'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            <span className="text-sm text-slate-500 mt-2">Tiến độ</span>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Nội dung khóa học ({chapters.length} chương • {resources.length} tài nguyên)
          </h2>

          {chapters.length > 0 ? (
            <div className="space-y-4">
              {chapters.map((chapter, chapterIndex) => {
                const chapterResources = resourcesByChapter(chapter.id);
                return (
                  <div
                    key={chapter.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaFolder className="text-[#49BBBD]" />
                        <span className="font-bold text-slate-800">
                          Chương {chapterIndex + 1}: {chapter.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {chapterResources.length} tài nguyên
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {chapterResources.length > 0 ? (
                        chapterResources.map((resource, index) => {
                          const rid = getResourceId(resource);
                          const status =
                            rid != null ? getResourceStatus(rid) : 'NOT_STARTED';
                          const resourceProgress =
                            rid != null ? resourceProgressMap[rid] : undefined;
                          const isQuiz = resource.resourceType === 'QUIZ';
                          const isCompleted = status === 'COMPLETED';
                          const isInProgress = status === 'IN_PROGRESS';

                          return (
                            <div
                              key={rid ?? `res-${index}`}
                              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <FaCheckCircle className="text-green-500 text-xl" />
                                  ) : isInProgress ? (
                                    <div className="w-8 h-8 bg-[#49BBBD] rounded-full flex items-center justify-center">
                                      <FaPlay className="text-white text-xs" />
                                    </div>
                                  ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      isQuiz ? 'bg-amber-100' : 'bg-slate-200'
                                    }`}>
                                      <span className="text-slate-500 text-sm font-medium">
                                        {index + 1}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-slate-900 truncate">
                                    {resource.title || resource.fileName || 'Không tên'}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <StatusBadge status={status} />
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      isQuiz
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {resource.resourceType}
                                    </span>
                                    {(resourceProgress?.totalTimeSpent ?? 0) > 0 && (
                                      <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <FaClock size={10} />
                                        {formatTimeSpent(resourceProgress!.totalTimeSpent)}
                                      </span>
                                    )}
                                    {resourceProgress?.score != null && (
                                      <span className="text-xs text-green-600 font-bold">
                                        Điểm: {Number(resourceProgress.score).toFixed(1)}
                                      </span>
                                    )}
                                    {resourceProgress?.isPassed === true && (
                                      <span className="text-xs font-bold text-green-600">
                                        ✓ Passed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs font-medium ${
                                isCompleted
                                  ? 'bg-green-50 text-green-600'
                                  : isInProgress
                                    ? 'bg-[#49BBBD]/10 text-[#49BBBD]'
                                    : 'bg-slate-100 text-slate-500'
                              }`}>
                                {isCompleted
                                  ? 'Hoàn thành'
                                  : isInProgress
                                    ? 'Đang học'
                                    : 'Chưa học'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 italic">
                          Chưa có tài nguyên trong chương này
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FaBook className="text-3xl mx-auto mb-3 text-slate-300" />
              <p>Chưa có chương và bài học nào</p>
            </div>
          )}
        </div>

        {/* QUIZ PROGRESS CARD */}
        <div>
          <QuizProgressCard
            resources={resources}
            resourceProgressMap={resourceProgressMap}
            userRole={userRole}
            variant="observed"
            onStartQuiz={(quiz) => {
              // ✅ Navigate tới QuizPage kèm studentId
              navigate(
                `/learn/${courseId}/quiz/${quiz.id}?studentId=${studentId}`
              );
            }}
          />
        </div>
      </div>

      {/* TÀI NGUYÊN BỔ SUNG */}
      {standaloneDocuments.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm mt-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Tài nguyên bổ sung ({standaloneDocuments.length})
          </h2>
          <div className="space-y-2">
            {standaloneDocuments.map((resource) => (
              <a
                key={getResourceId(resource)}
                href={resource.fileUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
                    📁
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {resource.title || resource.fileName || 'Không tên'}
                    </h3>
                    <p className="text-xs text-slate-500">{resource.resourceType}</p>
                  </div>
                </div>
                <span className="text-xs text-[#49BBBD] font-bold">Xem</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default StudentProgressPage;