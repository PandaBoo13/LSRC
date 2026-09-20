// ============================================================
// src/pages/elearning/StudentPages/LearningRoomPage.tsx
// ============================================================
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaChevronRight, FaSpinner, FaTimes, FaBookOpen,
  FaFolderOpen, FaCheckCircle, FaPlayCircle, FaRedo, FaExclamationTriangle
} from 'react-icons/fa';

import { VideoPlayer } from '../../../components/elearning/lesson/VideoPlayer';
import { LessonContent } from '../../../components/elearning/lesson/LessonContent';
import { LessonResources } from '../../../components/elearning/lesson/LessonResources';
import { LessonSidebar } from '../../../components/elearning/lesson/LessonSidebar';

import { getResourcesByCourse, getResourceById } from '../../../service/courseResourceService';
import { getChaptersByCourse } from '../../../service/chapterService';
import { getCourseById } from '../../../service/courseService';

import {
  getResourceProgressSafe,
  startResource,
  completeResource,
  updateResourceProgress,
  resetResourceProgress,
  getResourceProgressByCourse,
} from '../../../service/progress/progressService';

import {
  isProgressCompleted,
  isProgressInProgress,
} from '../../../service/progress/progress.types';
import type { ProgressResponse } from '../../../service/progress/progress.types';

import { useLearningTimer } from '../../../hooks/useProgress';

import type { Chapter } from '../../../types/chapter.types';
import type { CourseResource } from '../../../types/courseResource.types';
import type { Course } from '../../../types/course.types';

const COMPLETE_THRESHOLD = 10;
const IS_DEV = import.meta.env?.DEV ?? false;

// ==================== HELPER: Lấy video URL ====================
function extractVideoUrl(resource: CourseResource | null | undefined): string | null {
  if (!resource) return null;

  const settings: any = (resource as any).settings;
  if (settings) {
    if (typeof settings === 'object' && settings.videoUrl) return settings.videoUrl;
    if (typeof settings === 'string') {
      try {
        const parsed = JSON.parse(settings);
        if (parsed?.videoUrl) return parsed.videoUrl;
      } catch {}
    }
  }

  const fileUrl = (resource as any).fileUrl || (resource as any).file_url;
  return fileUrl || null;
}

export function LearningRoomPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allResources, setAllResources] = useState<CourseResource[]>([]);
  const [lesson, setLesson] = useState<CourseResource | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);

  // ✅ FIXED: 2 loading state — initial chỉ chạy 1 lần, lesson chạy khi đổi bài
  const [initialLoading, setInitialLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'resources'>('content');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const numericCourseId = Number(courseId);
  const numericLessonId = Number(lessonId);

  const progressRef = useRef<ProgressResponse | null>(null);

  // ✅ FIXED: request ID để chống race condition khi click lesson liên tục
  const lessonFetchIdRef = useRef(0);

  // ==================== TOAST ====================
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ==================== SYNC PROGRESS ====================
  const syncProgress = useCallback((newProgress: ProgressResponse | null) => {
    setProgress(newProgress);
    progressRef.current = newProgress;
  }, []);

  // ==================== DERIVED: ALL LESSONS (VIDEO) ====================
  const allLessons = useMemo<CourseResource[]>(
    () => allResources.filter((r) => r.resourceType === 'VIDEO'),
    [allResources]
  );

  // ==================== DERIVED: RESOURCES OF CURRENT CHAPTER ====================
  const resources = useMemo<CourseResource[]>(() => {
    if (!lesson) return allLessons;

    const lessonChapterId =
      (lesson as any)?.chapterId ?? (lesson as any)?.chapter_id ?? null;

    if (!lessonChapterId) {
      return [lesson];
    }

    const chapterResources = allResources.filter(
      (r) =>
        ((r as any).chapterId ?? (r as any).chapter_id) === lessonChapterId
    );
    const hasLesson = chapterResources.some((r) => r.id === lesson.id);
    if (!hasLesson) chapterResources.unshift(lesson);
    return chapterResources;
  }, [lesson, allResources, allLessons]);

  // ==================== DERIVED: CURRENT CHAPTER ====================
  const currentChapter = useMemo<Chapter | null>(() => {
    if (!lesson) return null;
    const chapterId = (lesson as any)?.chapterId ?? (lesson as any)?.chapter_id;
    if (!chapterId) return null;
    return chapters.find((ch) => ch.id === chapterId) ?? null;
  }, [lesson, chapters]);

  // ==================== DERIVED: NAVIGATION INDEX ====================
  const flatIndex = useMemo(
    () => allLessons.findIndex((l) => l.id === numericLessonId),
    [allLessons, numericLessonId]
  );
  const prevLesson = flatIndex > 0 ? allLessons[flatIndex - 1] : null;
  const nextLesson =
    flatIndex >= 0 && flatIndex < allLessons.length - 1
      ? allLessons[flatIndex + 1]
      : null;

  // ==================== DERIVED: VIDEO ====================
  const videoResources = useMemo<CourseResource[]>(() => {
    const isVideo = (r: CourseResource) => r.resourceType === 'VIDEO';
    const current = lesson && isVideo(lesson) ? [lesson] : [];
    const siblings = resources.filter((r) => isVideo(r) && r.id !== lesson?.id);
    if (current.length === 0 && siblings.length === 0) return allLessons;
    return [...current, ...siblings];
  }, [lesson, resources, allLessons]);

  const currentVideoUrl = useMemo(() => extractVideoUrl(lesson), [lesson]);

  // ==================== EFFECT A: FETCH SHARED DATA (chỉ khi courseId đổi) ====================
  useEffect(() => {
    if (!numericCourseId) return;

    let cancelled = false;
    setInitialLoading(true);
    setError(null);

    Promise.all([
      getCourseById(numericCourseId),
      getChaptersByCourse(numericCourseId).catch(() => []),
      getResourcesByCourse(numericCourseId).catch(() => []),
    ])
      .then(([courseData, chaptersData, resourcesData]) => {
        if (cancelled) return;
        setCourse(courseData);
        setChapters(Array.isArray(chaptersData) ? chaptersData : []);
        setAllResources(Array.isArray(resourcesData) ? resourcesData : []);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || 'Không tải được dữ liệu khóa học');
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [numericCourseId]);

  // ==================== EFFECT B: FETCH LESSON + PROGRESS (khi lessonId đổi) ====================
  useEffect(() => {
    if (!numericLessonId || !numericCourseId) return;

    const reqId = ++lessonFetchIdRef.current;

    setLessonLoading(true);
    setError(null);

    // Reset lesson để không hiển thị dữ liệu cũ
    setLesson(null);
    syncProgress(null);

    (async () => {
      try {
        const lessonData = await getResourceById(numericLessonId);
        if (reqId !== lessonFetchIdRef.current) return;
        setLesson(lessonData);

        // Progress: thử lấy trước, không có thì tạo mới
        let progressData = await getResourceProgressSafe(numericLessonId);
        if (reqId !== lessonFetchIdRef.current) return;

        if (!progressData) {
          try {
            progressData = await startResource(numericLessonId, numericCourseId);
          } catch (err: any) {
            if (err?.response?.status === 409) {
              progressData = await getResourceProgressSafe(numericLessonId);
            } else {
              throw err;
            }
          }
        }

        if (reqId !== lessonFetchIdRef.current) return;
        if (progressData) syncProgress(progressData);
      } catch (err: any) {
        if (reqId !== lessonFetchIdRef.current) return;
        setError(err?.message || 'Không thể tải bài học');
      } finally {
        if (reqId === lessonFetchIdRef.current) {
          setLessonLoading(false);
        }
      }
    })();
  }, [numericLessonId, numericCourseId, syncProgress]);

  // ==================== EFFECT C: SCROLL TO TOP khi lessonId đổi ====================
  useEffect(() => {
    if (!numericLessonId) return;
    // Smooth scroll nhẹ nhàng — không reload trang
    const main = document.getElementById('learning-main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [numericLessonId]);

  // ==================== EFFECT D: FETCH COMPLETED LESSONS ====================
  const fetchCompletedLessons = useCallback(async () => {
    if (!numericCourseId) return;
    try {
      const allProgress = await getResourceProgressByCourse(numericCourseId);
      const completed = allProgress
        .filter(isProgressCompleted)
        .map((p) => p.referenceId)
        .filter((id): id is number => id != null);
      setCompletedLessonIds(completed);
    } catch (err) {
      console.error('Failed to fetch completed lessons:', err);
    }
  }, [numericCourseId]);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  // ==================== TRACKING TIME ====================
  useLearningTimer(
    numericLessonId || null,
    !!progress?.id && !isProgressCompleted(progress)
  );

  // ==================== VIDEO HANDLERS ====================
  const handleVideoProgress = async (percent: number, timeSpent?: number) => {
    if (!progressRef.current?.id) {
      try {
        const newProgress = await startResource(numericLessonId, numericCourseId);
        syncProgress(newProgress);
      } catch (err: any) {
        if (err?.response?.status === 409) {
          const existing = await getResourceProgressSafe(numericLessonId);
          if (existing) syncProgress(existing);
          else return;
        } else {
          console.error('Failed to start resource:', err);
          return;
        }
      }
    }

    const currentProgress = progressRef.current;
    if (!currentProgress?.id || isProgressCompleted(currentProgress)) return;

    try {
      const updated = await updateResourceProgress(
        numericLessonId,
        percent,
        timeSpent && timeSpent > 0 ? timeSpent : undefined
      );
      syncProgress(updated);

      if (percent >= 100 && !isProgressCompleted(updated)) {
        try {
          const completed = await completeResource(numericLessonId);
          syncProgress(completed);
          setCompletedLessonIds((prev) => [...new Set([...prev, numericLessonId])]);
          showToast('Đã ghi nhận hoàn thành bài học!', 'success');
        } catch (err: any) {
          const msg =
            err?.response?.data?.message || 'Chưa đủ thời gian xem để hoàn thành';
          showToast(msg, 'error');
        }
      }
    } catch (err: any) {
      console.error('Update progress failed:', err?.response?.data?.message || err?.message);
      if (percent >= 100) showToast('Lỗi khi cập nhật tiến độ', 'error');
    }
  };

  const handleVideoEnded = () => {
    if (!isProgressCompleted(progressRef.current)) {
      handleVideoProgress(100);
    }
  };

  // ==================== RESET PROGRESS ====================
  const handleResetProgress = async () => {
    try {
      await resetResourceProgress(numericLessonId);
      setShowResetConfirm(false);

      const refreshed = await getResourceProgressSafe(numericLessonId);
      syncProgress(refreshed);
      await fetchCompletedLessons();

      showToast('Đã reset tiến độ bài học!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi reset tiến độ', 'error');
    }
  };

  // ==================== NAVIGATION ====================
  const goToLesson = (id: number) => {
    if (id === numericLessonId) return;
    navigate(`/learn/${courseId}/${id}`);
  };

  // ==================== INITIAL LOADING (chỉ 1 lần đầu) ====================
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <FaSpinner className="h-9 w-9 animate-spin text-[#49BBBD]" />
      </div>
    );
  }

  // ==================== INITIAL ERROR (không có course) ====================
  if (error && !course) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">{error || 'Không tải được khóa học'}</p>
          <Link
            to="/my-courses"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#49BBBD] hover:text-[#3db0b2]"
          >
            <FaArrowLeft size={12} /> Quay lại khóa học của tôi
          </Link>
        </div>
      </div>
    );
  }

  const lessonTitle = lesson?.title || lesson?.fileName || 'Đang tải...';
  const isCompleted = isProgressCompleted(progress);
  const isInProgress = isProgressInProgress(progress);

  // ==================== MAIN ====================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm animate-bounce-in">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span className="text-sm">{toast.type === 'success' ? '🎉' : '⚠️'}</span>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Sticky Header — LUÔN RENDER, không unmount khi đổi lesson */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/my-courses"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-[#49BBBD] hover:text-[#49BBBD] transition"
              title="Quay lại khóa học của tôi"
            >
              <FaArrowLeft size={13} />
            </Link>
            <div>
              <h1 className="text-base font-bold text-[#2F327D] line-clamp-1">
                {course?.title || 'Khóa học'}
              </h1>
              <p className="text-xs text-slate-400">
                {currentChapter && `${currentChapter.title} • `}
                {flatIndex >= 0 ? `Bài ${flatIndex + 1} / ${allLessons.length}` : 'Đang tải...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isCompleted ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                  <FaCheckCircle size={12} /> Đã hoàn thành
                </span>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-rose-300 hover:text-rose-500 transition"
                  title="Reset tiến độ bài học"
                >
                  <FaRedo size={10} /> Reset
                </button>
              </>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#49BBBD]/30 bg-[#49BBBD]/10 px-3 py-1 text-xs font-medium text-[#49BBBD]">
                <FaPlayCircle size={12} /> Đang học
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="learning-main" className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            {/* ✅ FIXED: Chỉ vùng lesson đổi, header + sidebar giữ nguyên */}
            {lessonLoading || !lesson ? (
              <LessonSkeleton />
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
                <p className="text-sm font-semibold text-rose-700">{error}</p>
              </div>
            ) : (
              <>
                {lesson.resourceType === 'VIDEO' && !currentVideoUrl && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Không tìm thấy URL video</p>
                      <p className="text-xs mt-1 text-amber-700">
                        Bài học chưa được cấu hình URL video. Vui lòng liên hệ giảng viên hoặc admin.
                      </p>
                    </div>
                  </div>
                )}

                <VideoPlayer
                  resources={videoResources}
                  lessonTitle={lessonTitle}
                  onEnded={handleVideoEnded}
                  onProgress={handleVideoProgress}
                  completeThreshold={COMPLETE_THRESHOLD}
                />

                {/* Tabs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex gap-2 border-b border-slate-200 pb-4">
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        activeTab === 'content'
                          ? 'bg-[#49BBBD] text-white shadow-lg shadow-[#49BBBD]/20'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                    >
                      <FaBookOpen size={13} /> Nội dung bài học
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        activeTab === 'resources'
                          ? 'bg-[#49BBBD] text-white shadow-lg shadow-[#49BBBD]/20'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                    >
                      <FaFolderOpen size={13} /> Tài nguyên ({resources.length})
                    </button>
                  </div>

                  <div className="pt-5">
                    {activeTab === 'content' && <LessonContent lesson={lesson} />}
                    {activeTab === 'resources' && <LessonResources resources={resources} />}
                  </div>
                </div>

                {/* Prev / Next */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {prevLesson ? (
                    <button
                      onClick={() => goToLesson(prevLesson.id)}
                      className="group flex flex-col items-start gap-1 rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-[#49BBBD]/50 hover:shadow-md transition"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-[#49BBBD]">
                        <FaArrowLeft size={10} /> Bài trước
                      </span>
                      <span className="text-sm font-medium text-slate-700 line-clamp-1">
                        {prevLesson.title}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <button
                      onClick={() => goToLesson(nextLesson.id)}
                      className="group flex flex-col items-end gap-1 rounded-2xl border border-slate-200 bg-white p-4 text-right hover:border-[#49BBBD]/50 hover:shadow-md transition sm:col-start-2"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#49BBBD]">
                        Bài tiếp theo <FaChevronRight size={10} />
                      </span>
                      <span className="text-sm font-medium text-slate-700 line-clamp-1">
                        {nextLesson.title}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </>
            )}
          </section>

          {/* Right Sidebar — LUÔN RENDER */}
          <aside className="xl:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <LessonSidebar
                chapters={chapters}
                allLessons={allLessons}
                currentLessonId={numericLessonId}
                completedLessonIds={completedLessonIds}
                onLessonClick={goToLesson}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* RESET CONFIRM MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset tiến độ bài học?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Hành động này sẽ xóa tiến độ và thời gian học của bài này. Bạn sẽ phải học lại từ đầu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SKELETON (chỉ vùng lesson) ====================
function LessonSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Video skeleton */}
      <div className="rounded-2xl bg-slate-200 aspect-video w-full" />

      {/* Tabs + content skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex gap-2 border-b border-slate-200 pb-4">
          <div className="h-9 w-40 rounded-xl bg-slate-200" />
          <div className="h-9 w-40 rounded-xl bg-slate-200" />
        </div>
        <div className="space-y-2 pt-4">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
        </div>
      </div>

      {/* Prev/Next skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}