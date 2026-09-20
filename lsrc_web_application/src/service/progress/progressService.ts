// src/service/progressService.ts
import api from '../../api/axiosConfig';
import type {
  ProgressResponse,
  ProgressUpdateRequest,
  ProgressTimeSpentRequest,
  ProgressScoreRequest,
} from './progress.types';
import type { RequestResponse } from '../../types/course.types';

// ==================== NORMALIZE HELPERS ====================

/**
 * ✅ Chuẩn hóa response từ BE.
 * - Đảm bảo `isPassed` đọc được từ cả `isPassed` (Boolean) lẫn `passed` (primitive boolean).
 * - Đảm bảo `score`/`maxScore` là number (BE có thể trả string nếu config Jackson khác).
 * - Đảm bảo `progressPercentage`, `totalTimeSpent` là number.
 */
const normalizeProgress = (raw: any): ProgressResponse => {
  if (!raw) return raw;

  const toNumber = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  };

  // ✅ Xử lý isPassed — ưu tiên field `isPassed`, fallback `passed`
  let isPassed: boolean | null = null;
  if (typeof raw.isPassed === 'boolean') isPassed = raw.isPassed;
  else if (typeof raw.passed === 'boolean') isPassed = raw.passed;

  return {
    ...raw,
    progressPercentage: toNumber(raw.progressPercentage) ?? 0,
    totalTimeSpent: toNumber(raw.totalTimeSpent) ?? 0,
    score: toNumber(raw.score),
    maxScore: toNumber(raw.maxScore),
    attempts: toNumber(raw.attempts),
    totalItems: toNumber(raw.totalItems),
    completedItems: toNumber(raw.completedItems),
    weightedScore: toNumber(raw.weightedScore),
    totalWeightPercent: toNumber(raw.totalWeightPercent),
    isPassed,
  };
};

/** Normalize list */
const normalizeProgressList = (rawList: any): ProgressResponse[] => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeProgress);
};

// ==================== COURSE PROGRESS ====================

/**
 * Lấy tiến độ khóa học của học viên hiện tại.
 * GET /api/progress/course/{courseId}
 */
export const getCourseProgress = async (courseId: number): Promise<ProgressResponse> => {
  const response = await api.get<RequestResponse<ProgressResponse>>(
    `/progress/course/${courseId}`
  );
  return normalizeProgress(response.data.data);
};

/**
 * Lấy danh sách tiến độ tất cả khóa học của học viên.
 * GET /api/progress/my-progress
 */
export const getMyProgress = async (): Promise<ProgressResponse[]> => {
  const response = await api.get<RequestResponse<ProgressResponse[]>>('/progress/my-progress');
  return normalizeProgressList(response.data.data);
};

/**
 * Bắt đầu học khóa học (tạo COURSE progress nếu chưa có).
 * POST /api/progress/course/{courseId}/start
 */
export const startCourse = async (courseId: number): Promise<ProgressResponse> => {
  const response = await api.post<RequestResponse<ProgressResponse>>(
    `/progress/course/${courseId}/start`
  );
  return normalizeProgress(response.data.data);
};

/**
 * Tính lại tiến độ khóa học (thường không cần gọi từ FE — BE tự làm sau mỗi thay đổi resource).
 * POST /api/progress/course/{courseId}/recalculate
 */
export const recalculateCourseProgress = async (courseId: number): Promise<ProgressResponse> => {
  const response = await api.post<RequestResponse<ProgressResponse>>(
    `/progress/course/${courseId}/recalculate`
  );
  return normalizeProgress(response.data.data);
};

/**
 * Cập nhật thời gian học khóa học (cộng dồn).
 * PUT /api/progress/course/{courseId}/time-spent
 */
export const updateCourseTimeSpent = async (
  courseId: number,
  timeSpent: number
): Promise<ProgressResponse> => {
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/course/${courseId}/time-spent`,
    { timeSpent } as ProgressTimeSpentRequest
  );
  return normalizeProgress(response.data.data);
};

/**
 * Đánh dấu hoàn thành khóa học (thủ công — thường BE tự làm khi đủ điều kiện).
 * PUT /api/progress/course/{courseId}/complete
 */
export const completeCourse = async (courseId: number): Promise<ProgressResponse> => {
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/course/${courseId}/complete`
  );
  return normalizeProgress(response.data.data);
};

/**
 * [TEACHER/ADMIN] Lấy tiến độ tất cả học viên trong khóa học.
 * GET /api/progress/course/{courseId}/all
 */
export const getStudentsProgressByCourse = async (
  courseId: number
): Promise<ProgressResponse[]> => {
  const response = await api.get<RequestResponse<ProgressResponse[]>>(
    `/progress/course/${courseId}/all`
  );
  return normalizeProgressList(response.data.data);
};

/**
 * Reset toàn bộ tiến độ khóa học (xóa hết resource progress + quiz attempts).
 * DELETE /api/progress/course/{courseId}/reset
 */
export const resetCourseProgress = async (courseId: number): Promise<void> => {
  await api.delete(`/progress/course/${courseId}/reset`);
};

// ==================== RESOURCE PROGRESS ====================

/**
 * Bắt đầu học resource (tạo RESOURCE progress nếu chưa có).
 * POST /api/progress/resource/{resourceId}/start?courseId={courseId}
 */
export const startResource = async (
  resourceId: number,
  courseId: number
): Promise<ProgressResponse> => {
  const response = await api.post<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}/start`,
    null,
    { params: { courseId } }
  );
  return normalizeProgress(response.data.data);
};

/**
 * Lấy tiến độ 1 resource.
 * GET /api/progress/resource/{resourceId}
 */
export const getResourceProgress = async (
  resourceId: number
): Promise<ProgressResponse> => {
  const response = await api.get<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}`
  );
  return normalizeProgress(response.data.data);
};

/**
 * Lấy tiến độ tất cả resources trong khóa học.
 * GET /api/progress/course/{courseId}/resources
 */
export const getResourceProgressByCourse = async (
  courseId: number
): Promise<ProgressResponse[]> => {
  const response = await api.get<RequestResponse<ProgressResponse[]>>(
    `/progress/course/${courseId}/resources`
  );
  return normalizeProgressList(response.data.data);
};

/**
 * Cập nhật % tiến độ resource.
 * PUT /api/progress/resource/{resourceId}
 *
 * ⚠️ Lưu ý BE:
 * - BE chỉ cho phép % TĂNG, không giảm (trừ khi reset).
 * - Với VIDEO, BE áp dụng anti-cheat: nếu % >= 100 nhưng time_spent < 80% duration → cap ở 99%.
 * - Nếu truyền `timeSpent`, BE cộng dồn luôn (không cần gọi riêng endpoint time-spent).
 */
export const updateResourceProgress = async (
  resourceId: number,
  progress: number,
  timeSpent?: number
): Promise<ProgressResponse> => {
  const body: ProgressUpdateRequest = { progress };
  if (typeof timeSpent === 'number' && timeSpent > 0) {
    body.timeSpent = timeSpent;
  }
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}`,
    body
  );
  return normalizeProgress(response.data.data);
};

/**
 * Cập nhật thời gian học resource (cộng dồn).
 * PUT /api/progress/resource/{resourceId}/time-spent
 *
 * 💡 Dùng để track thời gian học mỗi 30s/lần khi user đang xem video.
 */
export const updateResourceTimeSpent = async (
  resourceId: number,
  timeSpent: number
): Promise<ProgressResponse> => {
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}/time-spent`,
    { timeSpent } as ProgressTimeSpentRequest
  );
  return normalizeProgress(response.data.data);
};

/**
 * Cập nhật điểm số resource (quiz).
 * PUT /api/progress/resource/{resourceId}/score
 *
 * 💡 BE sẽ:
 * - So sánh với `passing_score` của resource → quyết định passed.
 * - Nếu passed → tự động complete resource.
 * - Sync attempts từ quiz_attempt.
 */
export const updateResourceScore = async (
  resourceId: number,
  data: ProgressScoreRequest
): Promise<ProgressResponse> => {
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}/score`,
    data
  );
  return normalizeProgress(response.data.data);
};

/**
 * Đánh dấu hoàn thành resource (thủ công).
 * PUT /api/progress/resource/{resourceId}/complete
 *
 * ⚠️ Với VIDEO, BE validate: time_spent >= 80% duration.
 * Nếu chưa đủ → throw 400 Bad Request.
 */
export const completeResource = async (
  resourceId: number
): Promise<ProgressResponse> => {
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}/complete`
  );
  return normalizeProgress(response.data.data);
};

/**
 * Tăng số lần thử quiz (sync từ quiz_attempt).
 * PUT /api/progress/resource/{resourceId}/attempt
 */
export const incrementResourceAttempt = async (
  resourceId: number
): Promise<ProgressResponse> => {
  const response = await api.put<RequestResponse<ProgressResponse>>(
    `/progress/resource/${resourceId}/attempt`
  );
  return normalizeProgress(response.data.data);
};

/**
 * Reset tiến độ resource (xóa RESOURCE progress + quiz attempts).
 * DELETE /api/progress/resource/{resourceId}/reset
 */
export const resetResourceProgress = async (resourceId: number): Promise<void> => {
  await api.delete(`/progress/resource/${resourceId}/reset`);
};

// ==================== BATCH / AGGREGATE ====================

/**
 * Lấy tiến độ của 1 resource trong course + normalize.
 * Trả về null nếu chưa có progress (thay vì throw).
 * Dùng cho việc load nhiều resource progress mà không muốn try/catch.
 */
export const getResourceProgressSafe = async (
  resourceId: number
): Promise<ProgressResponse | null> => {
  try {
    return await getResourceProgress(resourceId);
  } catch (err: any) {
    // BE throw 404 nếu chưa có progress → coi như null
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

/**
 * Lấy map { resourceId → ProgressResponse } cho 1 course.
 * Tiện cho việc render sidebar (đánh dấu bài đã hoàn thành).
 */
export const getResourceProgressMapByCourse = async (
  courseId: number
): Promise<Record<number, ProgressResponse>> => {
  const list = await getResourceProgressByCourse(courseId);
  const map: Record<number, ProgressResponse> = {};
  for (const p of list) {
    if (p.referenceId != null) {
      map[p.referenceId] = p;
    }
  }
  return map;
};

/**
 * Lấy danh sách resourceId đã hoàn thành trong course.
 * Dùng cho component sidebar highlight.
 */
export const getCompletedResourceIds = async (
  courseId: number
): Promise<number[]> => {
  const list = await getResourceProgressByCourse(courseId);
  return list
    .filter(p => p.status === 'COMPLETED' && p.referenceId != null)
    .map(p => p.referenceId as number);
};

// ==================== INSTRUCTOR / ADMIN ====================

/**
 * [INSTRUCTOR / ADMIN ONLY] Lấy RESOURCE progress của 1 học viên cụ thể.
 *
 * BE check quyền:
 *  - Instructor sở hữu course → OK.
 *  - Admin → OK.
 *  - Khác → 403 Forbidden.
 *
 * @param courseId   ID khóa học
 * @param studentId  accountId của học viên cần xem
 * @returns List ProgressResponse (đã normalize)
 *
 * GET /api/progress/instructor/course/{courseId}/student/{studentId}
 */
export const getStudentResourceProgressForInstructor = async (
  courseId: number,
  studentId: number
): Promise<ProgressResponse[]> => {
  const response = await api.get<RequestResponse<ProgressResponse[]>>(
    `/progress/instructor/course/${courseId}/student/${studentId}`
  );
  return normalizeProgressList(response.data.data);
};

/**
 * [INSTRUCTOR / ADMIN] Lấy map { resourceId → ProgressResponse } của 1 học viên.
 * Tiện cho render UI sidebar/table khi cần tra cứu theo resourceId.
 */
export const getStudentResourceProgressMapForInstructor = async (
  courseId: number,
  studentId: number
): Promise<Record<number, ProgressResponse>> => {
  const list = await getStudentResourceProgressForInstructor(courseId, studentId);
  const map: Record<number, ProgressResponse> = {};
  for (const p of list) {
    if (p.referenceId != null) {
      map[p.referenceId] = p;
    }
  }
  return map;
};