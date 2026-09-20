// ============================================================
// src/pages/elearning/StudentPages/CourseProgressDetailPage.tsx
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaPlay, FaCheckCircle, FaClock, FaGraduationCap,
  FaClipboardCheck, FaFolder, FaBook, FaSpinner,
} from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { ProgressBar } from '../../../components/elearning/progress/ProgressBar';
import { StatusBadge } from '../../../components/elearning/progress/StatusBadge';
import { QuizProgressCard } from '../../../components/elearning/course/course-details/QuizProgressCard';
import { studentNav } from '../../../data/elearning';
import {
  getCourseProgress,
  getResourceProgressByCourse,
  startCourse,
  resetCourseProgress,
} from '../../../service/progress/progressService';
import { getResourcesByCourse } from '../../../service/courseResourceService';
import { getChaptersByCourse } from '../../../service/chapterService';
import {
  isProgressCompleted,
  isProgressInProgress,
  PROGRESS_STATUS,
} from '../../../service/progress/progress.types';
import type { ProgressResponse } from '../../../service/progress/progress.types';
import type { Chapter } from '../../../types/chapter.types';
import type { CourseResource } from '../../../types/courseResource.types';
import { formatDate, formatTimeSpent } from '../../../utils/progressUtils';

// ==================== HELPER: Lấy chapterId an toàn ====================
const getResourceChapterId = (r: CourseResource): number | null => {
  return (r as any)?.chapterId ?? (r as any)?.chapter_id ?? null;
};

// ==================== HELPER: Lấy resourceId an toàn ====================
const getResourceId = (r: CourseResource): number | null => {
  return (r as any)?.id ?? (r as any)?.idResource ?? null;
};

export const CourseProgressDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [resourceProgressMap, setResourceProgressMap] = useState<Record<number, ProgressResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // ==================== FETCH DATA ====================
  const fetchData = useCallback(async () => {
    if (!courseId) return;
    const numericCourseId = Number(courseId);

    try {
      setLoading(true);
      setError(null);

      const courseProgressPromise = getCourseProgress(numericCourseId).catch(async (err) => {
        if (err?.response?.status === 404) {
          try {
            return await startCourse(numericCourseId);
          } catch {
            return null;
          }
        }
        throw err;
      });

      const [courseProgress, chaptersData, resourcesData, resourceProgresses] = await Promise.all([
        courseProgressPromise,
        getChaptersByCourse(numericCourseId).catch(() => []),
        getResourcesByCourse(numericCourseId).catch(() => []),
        getResourceProgressByCourse(numericCourseId).catch(() => []),
      ]);

      setProgress(courseProgress ?? null);
      setChapters(Array.isArray(chaptersData) ? chaptersData : []);

      const allResources = Array.isArray(resourcesData) ? resourcesData : [];
      setResources(allResources);

      const progressMap: Record<number, ProgressResponse> = {};
      (resourceProgresses || []).forEach((rp: ProgressResponse) => {
        if (rp.referenceId != null) {
          progressMap[rp.referenceId] = rp;
        }
      });
      setResourceProgressMap(progressMap);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== HANDLERS ====================

  /** Điều hướng khi bấm vào resource (video hoặc quiz). */
  const handleStartResource = (resource: CourseResource) => {
    const rid = getResourceId(resource);
    if (rid == null) return;

    if (resource.resourceType === 'QUIZ') {
      navigate(`/learn/${courseId}/quiz/${rid}`);
    } else {
      navigate(`/learn/${courseId}/${rid}`);
    }
  };

  /**
   * ✅ FIXED: xử lý khi user bấm nút "Làm bài" trong QuizProgressCard.
   * Điều hướng đến QuizPage.
   */
  const handleStartQuiz = (quiz: CourseResource) => {
    const rid = getResourceId(quiz);
    if (rid == null) return;
    navigate(`/learn/${courseId}/quiz/${rid}`);
  };

  /** Reset tiến độ khóa học. */
  const handleResetProgress = async () => {
    if (!courseId || resetting) return;
    try {
      setResetting(true);
      await resetCourseProgress(Number(courseId));
      setShowResetConfirm(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể reset tiến độ');
    } finally {
      setResetting(false);
    }
  };

  /** Lấy trạng thái của 1 resource. */
  const getResourceStatus = (resourceId: number): string => {
    const rp = resourceProgressMap[resourceId];
    return rp?.status || PROGRESS_STATUS.NOT_STARTED;
  };

  // ==================== DERIVED DATA ====================
  const videoResources = resources.filter(r => r.resourceType === 'VIDEO');
  const quizResources = resources.filter(r => r.resourceType === 'QUIZ');
  const documentResources = resources.filter(r =>
    ['PDF', 'SLIDE', 'DOCUMENT', 'AUDIO', 'IMAGE', 'LINK', 'OTHER'].includes(r.resourceType || '')
  );

  const resourcesByChapter = (chapterId: number) => {
    return resources.filter(r => getResourceChapterId(r) === chapterId);
  };

  const standaloneDocuments = documentResources.filter(r => getResourceChapterId(r) == null);

  const progressPercentage = Number(progress?.progressPercentage) || 0;
  const totalItems = progress?.totalItems ?? (videoResources.length + quizResources.length);
  const completedItems = progress?.completedItems ?? 0;
  const totalTimeSpent = progress?.totalTimeSpent ?? 0;

  // ==================== LOADING ====================
  if (loading) {
    return (
      <DashboardShell role="Student" title="Đang tải..." subtitle="" navItems={studentNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  // ==================== ERROR ====================
  if (error) {
    return (
      <DashboardShell role="Student" title="Lỗi" subtitle="" navItems={studentNav}>
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="px-4 py-2 bg-[#49BBBD] text-white rounded-xl"
          >
            Quay lại
          </button>
        </div>
      </DashboardShell>
    );
  }

  // ==================== MAIN CONTENT ====================
  return (
    <DashboardShell
      role="Student"
      title={progress?.courseTitle || 'Course Progress'}
      subtitle="Theo dõi tiến độ học tập của bạn"
      navItems={studentNav}
    >
      <button
        onClick={() => navigate('/my-courses')}
        className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <FaArrowLeft /> Quay lại khóa học của tôi
      </button>

      {/* ==================== PROGRESS HEADER ==================== */}
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {progress?.courseTitle || 'Khóa học'}
              </h1>
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={resetting}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
              >
                Reset tiến độ
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={progress?.status || PROGRESS_STATUS.NOT_STARTED} />
              {progress?.lastAccessedAt && (
                <span className="text-sm text-slate-500">
                  Truy cập gần nhất: {formatDate(progress.lastAccessedAt)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Mục hoàn thành</span>
                <p className="text-lg font-bold text-slate-900">{completedItems} / {totalItems}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Video bài học</span>
                <p className="text-lg font-bold text-slate-900">{videoResources.length}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Thời gian học</span>
                <p className="text-lg font-bold text-slate-900">{formatTimeSpent(totalTimeSpent)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-xs text-slate-500">Hoàn thành</span>
                <p className="text-lg font-bold text-green-600">
                  {progress?.completedAt ? formatDate(progress.completedAt) : 'Chưa hoàn thành'}
                </p>
              </div>
            </div>

            {progress?.weightedScore != null && (
              <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-indigo-600" />
                    <span className="text-sm font-bold text-slate-700">Điểm tổng kết (theo trọng số)</span>
                  </div>
                  <span className="text-xl font-bold text-indigo-600">
                    {Number(progress.weightedScore).toFixed(2)}
                    {progress.totalWeightPercent != null && (
                      <span className="text-xs text-slate-500 font-normal">
                        {' '}/ {Number(progress.totalWeightPercent).toFixed(0)}%
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Circular Progress */}
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
                <span className="text-2xl font-bold text-slate-900">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
            <span className="text-sm text-slate-500 mt-2">Tiến độ</span>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar percentage={progressPercentage} showLabel size="lg" />
        </div>
      </div>

      {/* ==================== GRID: RESOURCES + QUIZ ==================== */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* ========== CỘT TRÁI ========== */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Nội dung khóa học ({chapters.length} chương • {resources.length} tài nguyên)
            </h2>

            {chapters.length > 0 ? (
              <div className="space-y-4">
                {chapters.map((chapter, chapterIndex) => {
                  const chapterResources = resourcesByChapter(chapter.id);
                  return (
                    <div key={chapter.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaFolder className="text-[#49BBBD]" />
                          <span className="font-bold text-slate-800">
                            Chương {chapterIndex + 1}: {chapter.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{chapterResources.length} tài nguyên</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {chapterResources.length > 0 ? (
                          chapterResources.map((resource, index) => {
                            const rid = getResourceId(resource);
                            const status = rid != null ? getResourceStatus(rid) : PROGRESS_STATUS.NOT_STARTED;
                            const resourceProgress = rid != null ? resourceProgressMap[rid] : undefined;
                            const isQuiz = resource.resourceType === 'QUIZ';

                            const isCompleted = isProgressCompleted(resourceProgress);
                            const isInProgress = isProgressInProgress(resourceProgress);

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
                                        {isQuiz ? (
                                          <FaClipboardCheck className="text-amber-600 text-sm" />
                                        ) : (
                                          <span className="text-slate-500 text-sm font-medium">{index + 1}</span>
                                        )}
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
                                        isQuiz ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
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
                                        <span className="text-xs font-bold text-green-600">✓ Passed</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleStartResource(resource)}
                                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                                    isCompleted ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                    : isInProgress ? 'bg-[#49BBBD]/10 text-[#49BBBD] hover:bg-[#49BBBD]/20'
                                    : isQuiz ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {isCompleted ? 'Xem lại'
                                    : isInProgress ? 'Tiếp tục'
                                    : isQuiz ? 'Làm quiz'
                                    : 'Bắt đầu'}
                                </button>
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

          {standaloneDocuments.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
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
        </div>

        {/* ========== CỘT PHẢI: QUIZ PROGRESS ========== */}
        <div>
          <QuizProgressCard
            resources={resources}
            resourceProgressMap={resourceProgressMap}
            onStartQuiz={handleStartQuiz}
          />
        </div>
      </div>

      {/* ==================== RESET CONFIRM MODAL ==================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset tiến độ khóa học?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Hành động này sẽ xóa toàn bộ tiến độ bài học và lịch sử làm bài quiz của bạn. Bạn không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleResetProgress}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetting ? <FaSpinner className="animate-spin" /> : null}
                {resetting ? 'Đang reset...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default CourseProgressDetailPage;