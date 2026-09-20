// src/service/lessonQuestionService.ts
import api from '../api/axiosConfig';
import type { RequestResponse } from '../types/course.types';
import type { LessonQuestionResponse, LessonQuestionRequest } from '../types/lessonQuestion.types';

// ==================== GET ====================

/**
 * Lấy danh sách câu hỏi của resource
 * GET /api/resources/{resourceId}/questions
 */
export const getQuestionsByResource = async (resourceId: number): Promise<LessonQuestionResponse[]> => {
  const response = await api.get<RequestResponse<LessonQuestionResponse[]>>(
    `/resources/${resourceId}/questions`
  );
  return response.data.data;
};

/**
 * Lấy danh sách resources chứa câu hỏi
 * GET /api/questions/{questionId}/resources
 */
export const getResourcesByQuestion = async (questionId: number): Promise<LessonQuestionResponse[]> => {
  const response = await api.get<RequestResponse<LessonQuestionResponse[]>>(
    `/questions/${questionId}/resources`
  );
  return response.data.data;
};

// ==================== ASSIGN ====================

/**
 * Gán câu hỏi vào resource
 * POST /api/resources/{resourceId}/questions/{questionId}/assign
 */
export const assignQuestion = async (
  resourceId: number,
  questionId: number,
  data?: { orderIndex?: number; points?: number }
): Promise<LessonQuestionResponse> => {
  const response = await api.post<RequestResponse<LessonQuestionResponse>>(
    `/resources/${resourceId}/questions/${questionId}/assign`,
    data || {}
  );
  return response.data.data;
};

/**
 * Gán nhiều câu hỏi vào resource
 * POST /api/resources/{resourceId}/questions/assign-batch
 */
export const assignQuestions = async (
  resourceId: number,
  questionIds: number[]
): Promise<LessonQuestionResponse[]> => {
  const response = await api.post<RequestResponse<LessonQuestionResponse[]>>(
    `/resources/${resourceId}/questions/assign-batch`,
    questionIds
  );
  return response.data.data;
};

// ==================== UPDATE ====================

/**
 * Cập nhật assignment
 * PUT /api/lesson-questions/{id}
 */
export const updateAssignment = async (
  id: number,
  data: LessonQuestionRequest
): Promise<LessonQuestionResponse> => {
  const response = await api.put<RequestResponse<LessonQuestionResponse>>(
    `/lesson-questions/${id}`,
    data
  );
  return response.data.data;
};

// ==================== DELETE ====================

/**
 * Bỏ gán câu hỏi khỏi resource
 * DELETE /api/resources/{resourceId}/questions/{questionId}/unassign
 */
export const unassignQuestion = async (resourceId: number, questionId: number): Promise<void> => {
  await api.delete(`/resources/${resourceId}/questions/${questionId}/unassign`);
};

/**
 * Xóa tất cả câu hỏi của resource
 * DELETE /api/resources/{resourceId}/questions
 */
export const removeAllQuestionsFromResource = async (resourceId: number): Promise<void> => {
  await api.delete(`/resources/${resourceId}/questions`);
};