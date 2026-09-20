// src/service/lessonProgressService.ts
import api from '../api/axiosConfig';
import type { LessonProgress } from '../types/lesson.types';
import type { RequestResponse } from '../types/course.types';

// ==================== STUDENT APIs ====================

/**
 * Bắt đầu học bài học
 * POST /api/lesson-progress/{lessonId}/start?courseId={courseId}
 */
export const startLesson = async (
  lessonId: number,
  courseId: number
): Promise<LessonProgress> => {
  const response = await api.post<RequestResponse<LessonProgress>>(
    `/lesson-progress/${lessonId}/start`,
    null,
    { params: { courseId } } // ✅ Đúng: @RequestParam
  );
  return response.data.data;
};

/**
 * Lấy tiến độ của một bài học
 * GET /api/lesson-progress/lesson/{lessonId}
 */
export const getLessonProgress = async (lessonId: number): Promise<LessonProgress> => {
  const response = await api.get<RequestResponse<LessonProgress>>(
    `/lesson-progress/lesson/${lessonId}`
  );
  return response.data.data;
};

/**
 * Lấy tiến độ tất cả bài học trong khóa học
 * GET /api/lesson-progress/course/{courseId}
 */
export const getLessonProgressByCourse = async (courseId: number): Promise<LessonProgress[]> => {
  const response = await api.get<RequestResponse<LessonProgress[]>>(
    `/lesson-progress/course/${courseId}`
  );
  return response.data.data;
};

/**
 * Cập nhật tiến độ bài học
 * PUT /api/lesson-progress/lesson/{lessonId}
 * Body: { percentage }
 */
export const updateLessonProgress = async (
  lessonId: number,
  percentage: number
): Promise<LessonProgress> => {
  const response = await api.put<RequestResponse<LessonProgress>>(
    `/lesson-progress/lesson/${lessonId}`,
    { percentage } // ✅ Đúng: @RequestBody
  );
  return response.data.data;
};

/**
 * Cập nhật thời gian học
 * PUT /api/lesson-progress/lesson/{lessonId}/time-spent
 * Body: { timeSpent }
 */
export const updateLessonTimeSpent = async (
  lessonId: number,
  timeSpent: number
): Promise<LessonProgress> => {
  const response = await api.put<RequestResponse<LessonProgress>>(
    `/lesson-progress/lesson/${lessonId}/time-spent`,
    { timeSpent } // ✅ Đúng: @RequestBody
  );
  return response.data.data;
};

/**
 * Cập nhật điểm số
 * PUT /api/lesson-progress/lesson/{lessonId}/score
 * Body: { score, maxScore, isPassed }
 */
export const updateLessonScore = async (
  lessonId: number,
  data: { score: number; maxScore?: number; isPassed?: boolean }
): Promise<LessonProgress> => {
  const response = await api.put<RequestResponse<LessonProgress>>(
    `/lesson-progress/lesson/${lessonId}/score`,
    data // ✅ Đúng: @RequestBody
  );
  return response.data.data;
};

/**
 * Đánh dấu hoàn thành bài học
 * PUT /api/lesson-progress/lesson/{lessonId}/complete
 */
export const completeLesson = async (lessonId: number): Promise<LessonProgress> => {
  const response = await api.put<RequestResponse<LessonProgress>>(
    `/lesson-progress/lesson/${lessonId}/complete`
  );
  return response.data.data;
};