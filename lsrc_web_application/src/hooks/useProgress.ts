// src/hooks/useProgress.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getMyProgress,
  getCourseProgress,
  getStudentsProgressByCourse,     // ✅ dùng cho instructor
  getResourceProgressByCourse,      // dùng cho student
  updateResourceTimeSpent,
} from '../service/progress/progressService';
import type { ProgressResponse } from '../service/progress/progress.types';
import { calculateProgressOverview } from '../utils/progressUtils';
import type { ProgressOverview } from '../utils/progressUtils';

// ==================== CONSTANTS ====================

/** Interval auto-refresh cho real-time views (ms) */
const AUTO_REFRESH_INTERVAL = 60_000;    // ✅ Tăng từ 30s → 60s

/** Khoảng thời gian coi là "active" (ms) */
const ACTIVE_THRESHOLD_MS = 30 * 60 * 1000;  // 30 phút

/** Interval tracking timer học tập (ms) */
const TIMER_INTERVAL = 30_000;           // 30s

// ==================== HOOKS ====================

/**
 * Hook lấy danh sách tiến độ tất cả khóa học của student.
 * GET /api/progress/my-progress
 */
export const useMyCoursesProgress = () => {
  const [progresses, setProgresses] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<ProgressOverview>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    notStartedCourses: 0,
    averageProgress: 0,
    totalTimeSpent: 0,
  });

  const fetchProgresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProgress();
      const safeData = Array.isArray(data) ? data : [];
      setProgresses(safeData);
      setOverview(calculateProgressOverview(safeData));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'Không thể tải tiến độ học tập';
      setError(message);
      console.error('Failed to fetch progresses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgresses();
  }, [fetchProgresses]);

  return {
    progresses,
    overview,
    loading,
    error,
    refetch: fetchProgresses,
    isEmpty: !loading && progresses.length === 0,
  };
};

/**
 * Hook lấy tiến độ chi tiết của 1 khóa học (Student).
 * GET /api/progress/course/{courseId}
 * GET /api/progress/course/{courseId}/resources
 */
export const useCourseProgress = (courseId: number) => {
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [lessonsProgress, setLessonsProgress] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const [courseProgress, lessonProgressData] = await Promise.all([
        getCourseProgress(courseId),
        getResourceProgressByCourse(courseId).catch(() => []),  // ✅ Fallback an toàn
      ]);

      setProgress(courseProgress ?? null);
      setLessonsProgress(Array.isArray(lessonProgressData) ? lessonProgressData : []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'Không thể tải tiến độ khóa học';
      setError(message);
      console.error('Failed to fetch course progress:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    lessonsProgress,
    loading,
    error,
    refetch: fetchProgress,
  };
};

/**
 * Hook cho Instructor: Lấy tiến độ của tất cả học viên trong 1 khóa học.
 * GET /api/progress/course/{courseId}/all
 *
 * ⚠️ Auto refresh mỗi 60s. Chỉ refresh khi tab visible để tiết kiệm request.
 */
export const useStudentsProgress = (courseId: number) => {
  const [students, setStudents] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getStudentsProgressByCourse(courseId);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'Không thể tải danh sách học viên';
      setError(message);
      console.error('Failed to fetch students progress:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ✅ Auto refresh — chỉ khi tab visible
  useEffect(() => {
    if (!courseId) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStudents();
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [courseId, fetchStudents]);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    isEmpty: !loading && students.length === 0,
  };
};

/**
 * Hook tracking thời gian học tập cho 1 bài học.
 * Tự động gửi `updateResourceTimeSpent` mỗi 30s + khi unmount.
 *
 * @param resourceId  ID resource (null = tắt tracking)
 * @param isActive    Bật/tắt tracking (VD: pause video → tắt)
 * @returns           Tổng thời gian đã track trong session (giây)
 */
export const useLearningTimer = (
  resourceId: number | null,
  isActive: boolean = true
) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const resourceIdRef = useRef<number | null>(resourceId);

  // ✅ Cập nhật ref mỗi khi resourceId đổi — để cleanup dùng đúng id
  useEffect(() => {
    resourceIdRef.current = resourceId;
  }, [resourceId]);

  useEffect(() => {
    if (!isActive || !resourceId) {
      // Clear interval nếu có
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsed <= 0) return;

      setTimeSpent(prev => prev + elapsed);

      try {
        await updateResourceTimeSpent(resourceId, elapsed);
      } catch (err) {
        console.error('Failed to update time spent:', err);
      }

      startTimeRef.current = Date.now();
    }, TIMER_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        // ✅ Dùng resourceIdRef.current để tránh closure stale
        const currentResourceId = resourceIdRef.current;
        const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

        if (finalElapsed > 0 && currentResourceId) {
          updateResourceTimeSpent(currentResourceId, finalElapsed).catch(err =>
            console.error('Failed to save final time:', err)
          );
        }
      }
    };
  }, [resourceId, isActive]);

  // ✅ Reset time khi resourceId đổi
  useEffect(() => {
    setTimeSpent(0);
  }, [resourceId]);

  return timeSpent;
};

/**
 * Hook cho Instructor: Lấy danh sách học viên đang active trong 1 khóa học.
 *
 * ⚠️ FIX: Trước đây dùng `getResourceProgressByCourse` — endpoint này chỉ
 * dành cho STUDENT (yêu cầu enrollment). Instructor gọi sẽ 403.
 * Giờ dùng `getStudentsProgressByCourse` (endpoint `/progress/course/{id}/all`,
 * dành cho TEACHER/ADMIN) rồi filter theo `lastAccessedAt`.
 *
 * @param courseId    ID khóa học
 * @param autoRefresh Bật auto-refresh mỗi 60s (mặc định true)
 */
export const useActiveLearners = (
  courseId: number,
  autoRefresh: boolean = true
) => {
  const [learners, setLearners] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearners = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      // ✅ Dùng endpoint dành cho TEACHER/ADMIN
      const data = await getStudentsProgressByCourse(courseId);
      const safeList = Array.isArray(data) ? data : [];

      // Filter những người active trong 30 phút qua
      const now = Date.now();
      const activeLearners = safeList.filter(p => {
        if (!p.lastAccessedAt) return false;
        const lastAccess = new Date(p.lastAccessedAt).getTime();
        if (Number.isNaN(lastAccess)) return false;
        return now - lastAccess <= ACTIVE_THRESHOLD_MS;
      });

      // Sắp xếp mới nhất lên đầu
      activeLearners.sort((a, b) => {
        const ta = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const tb = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        return tb - ta;
      });

      setLearners(activeLearners);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'Không thể tải danh sách học viên';
      setError(message);
      console.error('Failed to fetch active learners:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  // ✅ Auto refresh — chỉ khi được bật + tab visible
  useEffect(() => {
    if (!courseId || !autoRefresh) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLearners();
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [courseId, autoRefresh, fetchLearners]);

  return {
    learners,
    loading,
    error,
    refetch: fetchLearners,
    isEmpty: !loading && learners.length === 0,
  };
};