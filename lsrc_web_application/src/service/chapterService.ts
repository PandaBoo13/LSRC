// src/service/chapterService.ts
import api from '../api/axiosConfig';
import type { Chapter, ChapterRequest, UpdateOrderRequest } from '../types/chapter.types';
import type { RequestResponse } from '../types/course.types';

/**
 * Lấy danh sách chương của khóa học (kèm lessons)
 */
export const getChaptersByCourse = async (courseId: number): Promise<Chapter[]> => {
  const response = await api.get<RequestResponse<Chapter[]>>(`/courses/${courseId}/chapters`);
  return response.data.data;
};

/**
 * Lấy chi tiết 1 chương
 */
export const getChapterById = async (chapterId: number): Promise<Chapter> => {
  const response = await api.get<RequestResponse<Chapter>>(`/chapters/${chapterId}`);
  return response.data.data;
};

/**
 * Lấy chương kèm bài học
 */
export const getChapterWithLessons = async (chapterId: number): Promise<Chapter> => {
  const response = await api.get<RequestResponse<Chapter>>(`/chapters/${chapterId}/lessons`);
  return response.data.data;
};

/**
 * Tạo chương mới
 */
export const createChapter = async (courseId: number, data: ChapterRequest): Promise<Chapter> => {
  const response = await api.post<RequestResponse<Chapter>>(`/courses/${courseId}/chapters`, data);
  return response.data.data;
};

/**
 * Cập nhật chương
 */
export const updateChapter = async (chapterId: number, data: ChapterRequest): Promise<Chapter> => {
  const response = await api.put<RequestResponse<Chapter>>(`/chapters/${chapterId}`, data);
  return response.data.data;
};

/**
 * Xóa chương
 */
export const deleteChapter = async (chapterId: number): Promise<void> => {
  await api.delete(`/chapters/${chapterId}`);
};

/**
 * Đổi thứ tự 1 chương
 */
export const updateChapterOrder = async (chapterId: number, newOrderIndex: number): Promise<void> => {
  await api.patch(`/chapters/${chapterId}/order`, { newOrderIndex });
};

/**
 * Cập nhật thứ tự hàng loạt
 */
export const updateChapterOrderBatch = async (
  updates: UpdateOrderRequest[]
): Promise<void> => {
  await api.put('/chapters/batch/order', updates);
};