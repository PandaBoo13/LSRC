// src/service/questionService.ts
import api from '../api/axiosConfig';
import type { Question, QuestionRequest, PageResponse } from '../types/question.types';
import type { RequestResponse } from '../types/course.types';

// ==================== GET ====================

export const getQuestionsByCourse = async (
  courseId: number,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Question>> => {
  const response = await api.get<RequestResponse<PageResponse<Question>>>(
    `/questions/course/${courseId}`,
    { params: { page, size } }
  );
  return response.data.data;
};

export const getAllQuestionsByCourse = async (courseId: number): Promise<Question[]> => {
  const response = await api.get<RequestResponse<Question[]>>(
    `/questions/course/${courseId}/all`
  );
  return response.data.data;
};

export const getQuestionById = async (id: number): Promise<Question> => {
  const response = await api.get<RequestResponse<Question>>(`/questions/${id}`);
  return response.data.data;
};

// ==================== ✅ LESSON QUERIES ====================

export const getQuestionsByLesson = async (lessonId: number): Promise<Question[]> => {
  const response = await api.get<RequestResponse<Question[]>>(
    `/questions/lesson/${lessonId}`
  );
  return response.data.data;
};

export const getQuestionsByLessons = async (lessonIds: number[]): Promise<Question[]> => {
  const response = await api.post<RequestResponse<Question[]>>(
    `/questions/lessons`,
    lessonIds
  );
  return response.data.data;
};

export const getRandomQuestionsByLessons = async (
  lessonIds: number[],
  limit: number = 10
): Promise<Question[]> => {
  const response = await api.post<RequestResponse<Question[]>>(
    `/questions/lessons/random`,
    lessonIds,
    { params: { limit } }
  );
  return response.data.data;
};

// ==================== RANDOM ====================

export const getRandomQuestions = async (courseId: number, limit: number = 10): Promise<Question[]> => {
  const response = await api.get<RequestResponse<Question[]>>(
    `/questions/course/${courseId}/random`,
    { params: { limit } }
  );
  return response.data.data;
};

// ==================== CREATE ====================

export const createQuestion = async (data: QuestionRequest): Promise<Question> => {
  const response = await api.post<RequestResponse<Question>>('/questions', data);
  return response.data.data;
};

// ==================== UPDATE ====================

export const updateQuestion = async (id: number, data: QuestionRequest): Promise<Question> => {
  const response = await api.put<RequestResponse<Question>>(`/questions/${id}`, data);
  return response.data.data;
};

// ==================== DELETE ====================

export const deleteQuestion = async (id: number): Promise<void> => {
  await api.delete(`/questions/${id}`);
};

export const getQuestionsByLessonPaginated = async (
  lessonId: number,
  page: number = 0,
  size: number = 5
): Promise<PageResponse<Question>> => {
  const response = await api.get<RequestResponse<PageResponse<Question>>>(
    `/questions/lesson/${lessonId}/paginated`,
    { params: { page, size } }
  );
  return response.data.data;
};