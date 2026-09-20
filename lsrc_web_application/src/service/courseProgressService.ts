// src/services/courseProgressService.ts
import api from '../api/axiosConfig';
import type { CourseProgressResponse } from './progress/progress.types';

/**
 * Lấy tiến độ của tôi trong 1 khóa học
 * GET /api/course-progress/course/{courseId}
 */
export const getMyCourseProgress = async (courseId: number): Promise<CourseProgressResponse> => {
  const response = await api.get(`/course-progress/course/${courseId}`);
  return response.data.data;
};

/**
 * Lấy danh sách tiến độ tất cả khóa học của tôi
 * GET /api/course-progress/my-progress
 */
export const getMyAllCourseProgress = async (): Promise<CourseProgressResponse[]> => {
  const response = await api.get('/course-progress/my-progress');
  return response.data.data;
};

/**
 * [Instructor] Lấy tiến độ học viên trong 1 khóa học
 * GET /api/course-progress/course/{courseId}/all
 */
export const getStudentsCourseProgress = async (courseId: number): Promise<CourseProgressResponse[]> => {
  const response = await api.get(`/course-progress/course/${courseId}/all`);
  return response.data.data;
};

/**
 * Bắt đầu học khóa học
 * POST /api/course-progress/{courseId}/start
 */
export const startCourse = async (courseId: number): Promise<CourseProgressResponse> => {
  const response = await api.post(`/course-progress/${courseId}/start`);
  return response.data.data;
};

// ✅ THÊM MỚI: Tự động tính lại tiến độ
/**
 * Tự động tính lại tiến độ khóa học từ DB
 * POST /api/course-progress/course/{courseId}/recalculate
 */
export const recalculateCourseProgress = async (courseId: number): Promise<CourseProgressResponse> => {
  const response = await api.post(`/course-progress/course/${courseId}/recalculate`);
  return response.data.data;
};

// ❌ XÓA: Không dùng nữa (server tự tính)
// export const updateCourseProgress = async (...) => { ... };

/**
 * Cập nhật thời gian học
 * PUT /api/course-progress/course/{courseId}/time-spent
 */
export const updateCourseTimeSpent = async (
  courseId: number,
  timeSpent: number
): Promise<CourseProgressResponse> => {
  const response = await api.put(`/course-progress/course/${courseId}/time-spent`, { timeSpent });
  return response.data.data;
};

/**
 * Đánh dấu hoàn thành khóa học
 * PUT /api/course-progress/course/{courseId}/complete
 */
export const completeCourse = async (courseId: number): Promise<CourseProgressResponse> => {
  const response = await api.put(`/course-progress/course/${courseId}/complete`);
  return response.data.data;
};