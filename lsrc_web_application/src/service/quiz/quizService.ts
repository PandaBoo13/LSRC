// ============================================
// src/service/quiz/quizService.ts
// ============================================
import api from '../../api/axiosConfig';
import type {
  Quiz,
  Question,
  QuestionLearner,
  QuizAttempt,
  CreateQuizRequest,
  UpdateQuizRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  AssignQuestionsRequest,
  SaveAnswersRequest,
  QuestionImportResponse,
  ImportQuestionsParams,
} from './quiz.types';

import type { RequestResponse, PageResponse } from '../../types/course.types';

// ==================== A. QUIZ MANAGEMENT ====================

/**
 * Tạo quiz mới.
 * POST /api/courses/{courseId}/quizzes
 * [ADMIN / TEACHER]
 */
export const createQuiz = async (
  courseId: number,
  data: CreateQuizRequest
): Promise<Quiz> => {
  const response = await api.post<RequestResponse<Quiz>>(
    `/courses/${courseId}/quizzes`,
    data
  );
  return response.data.data;
};

/**
 * Cập nhật quiz.
 * PUT /api/quizzes/{quizId}
 * [ADMIN / TEACHER]
 */
export const updateQuiz = async (
  quizId: number,
  data: UpdateQuizRequest
): Promise<Quiz> => {
  const response = await api.put<RequestResponse<Quiz>>(
    `/quizzes/${quizId}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa quiz.
 * DELETE /api/quizzes/{quizId}
 * [ADMIN / TEACHER]
 */
export const deleteQuiz = async (quizId: number): Promise<void> => {
  await api.delete(`/quizzes/${quizId}`);
};

/**
 * Lấy danh sách quiz của course.
 * GET /api/courses/{courseId}/quizzes
 */
export const getQuizzesByCourse = async (
  courseId: number
): Promise<Quiz[]> => {
  const response = await api.get<RequestResponse<Quiz[]>>(
    `/courses/${courseId}/quizzes`
  );
  return response.data.data;
};

/**
 * Lấy chi tiết quiz.
 * GET /api/quizzes/{quizId}
 */
export const getQuizById = async (quizId: number): Promise<Quiz> => {
  const response = await api.get<RequestResponse<Quiz>>(
    `/quizzes/${quizId}`
  );
  return response.data.data;
};

/**
 * Publish quiz.
 * PUT /api/quizzes/{quizId}/publish
 * [ADMIN / TEACHER]
 */
export const publishQuiz = async (quizId: number): Promise<Quiz> => {
  const response = await api.put<RequestResponse<Quiz>>(
    `/quizzes/${quizId}/publish`
  );
  return response.data.data;
};

/**
 * Đóng quiz (unpublish).
 * PUT /api/quizzes/{quizId}/close
 * [ADMIN / TEACHER]
 */
export const closeQuiz = async (quizId: number): Promise<Quiz> => {
  const response = await api.put<RequestResponse<Quiz>>(
    `/quizzes/${quizId}/close`
  );
  return response.data.data;
};

// ==================== B. QUESTION MANAGEMENT (ADMIN / INSTRUCTOR) ====================
// Các endpoint dưới trả full view (có correctAnswer + explanation).

/**
 * Tạo câu hỏi cho quiz.
 * POST /api/quizzes/{quizId}/questions
 * [ADMIN / TEACHER]
 */
export const createQuestionForQuiz = async (
  quizId: number,
  data: CreateQuestionRequest
): Promise<Question> => {
  const response = await api.post<RequestResponse<Question>>(
    `/quizzes/${quizId}/questions`,
    data
  );
  return response.data.data;
};

/**
 * Tạo câu hỏi (không gắn quiz).
 * POST /api/questions
 * [ADMIN / TEACHER]
 */
export const createQuestion = async (
  data: CreateQuestionRequest
): Promise<Question> => {
  const response = await api.post<RequestResponse<Question>>(
    '/questions',
    data
  );
  return response.data.data;
};

/**
 * Cập nhật câu hỏi.
 * PUT /api/questions/{questionId}
 * [ADMIN / TEACHER]
 */
export const updateQuestion = async (
  questionId: number,
  data: UpdateQuestionRequest
): Promise<Question> => {
  const response = await api.put<RequestResponse<Question>>(
    `/questions/${questionId}`,
    data
  );
  return response.data.data;
};

/**
 * Xóa câu hỏi.
 * DELETE /api/questions/{questionId}
 * [ADMIN / TEACHER]
 */
export const deleteQuestion = async (questionId: number): Promise<void> => {
  await api.delete(`/questions/${questionId}`);
};

// ==================== B2. QUESTION QUERIES — LEARNER VIEW ====================
// FIXED [CRITICAL]: 5 endpoint dưới trả QuestionLearner — KHÔNG có correctAnswer.
// Đảm bảo học viên không tải trước đáp án khi làm bài.

/**
 * Lấy danh sách câu hỏi của quiz — LEARNER VIEW.
 * GET /api/quizzes/{quizId}/questions
 *
 * FIXED: return type đổi từ Question[] → QuestionLearner[].
 * Student gọi → chỉ thấy content + options, KHÔNG có đáp án.
 */
export const getQuestionsByQuiz = async (
  quizId: number
): Promise<QuestionLearner[]> => {
  const response = await api.get<RequestResponse<QuestionLearner[]>>(
    `/quizzes/${quizId}/questions`
  );
  return response.data.data;
};

/**
 * Lấy câu hỏi theo lesson (phân trang) — LEARNER VIEW.
 * GET /api/questions/lesson/{lessonId}/paginated
 */
export const getQuestionsByLessonPaginated = async (
  lessonId: number,
  page: number = 0,
  size: number = 5
): Promise<PageResponse<QuestionLearner>> => {
  const response = await api.get<RequestResponse<PageResponse<QuestionLearner>>>(
    `/questions/lesson/${lessonId}/paginated`,
    { params: { page, size } }
  );
  return response.data.data;
};

/**
 * Lấy danh sách câu hỏi của course (phân trang) — LEARNER VIEW.
 * GET /api/courses/{courseId}/questions
 */
export const getQuestionsByCourse = async (
  courseId: number,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<QuestionLearner>> => {
  const response = await api.get<RequestResponse<PageResponse<QuestionLearner>>>(
    `/courses/${courseId}/questions`,
    { params: { page, size } }
  );
  return response.data.data;
};

/**
 * Lấy tất cả câu hỏi của course (không phân trang) — LEARNER VIEW.
 * GET /api/courses/{courseId}/questions/all
 */
export const getAllQuestionsByCourse = async (
  courseId: number
): Promise<QuestionLearner[]> => {
  const response = await api.get<RequestResponse<QuestionLearner[]>>(
    `/courses/${courseId}/questions/all`
  );
  return response.data.data;
};

/**
 * Lấy câu hỏi ngẫu nhiên — LEARNER VIEW.
 * GET /api/courses/{courseId}/questions/random
 */
export const getRandomQuestions = async (
  courseId: number,
  limit: number = 10
): Promise<QuestionLearner[]> => {
  const response = await api.get<RequestResponse<QuestionLearner[]>>(
    `/courses/${courseId}/questions/random`,
    { params: { limit } }
  );
  return response.data.data;
};

/**
 * Gán câu hỏi vào quiz.
 * POST /api/quizzes/{quizId}/assign-questions
 * [ADMIN / TEACHER]
 */
export const assignQuestionsToQuiz = async (
  quizId: number,
  data: AssignQuestionsRequest
): Promise<void> => {
  await api.post(`/quizzes/${quizId}/assign-questions`, data);
};

/**
 * Gỡ câu hỏi khỏi quiz.
 * DELETE /api/quizzes/{quizId}/questions/{questionId}
 * [ADMIN / TEACHER]
 */
export const unassignQuestion = async (
  quizId: number,
  questionId: number
): Promise<void> => {
  await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
};

// ==================== B3. IMPORT EXCEL ====================

/**
 * Import câu hỏi từ file Excel.
 * POST /api/questions/import-excel (multipart/form-data)
 * [ADMIN / TEACHER]
 */
export const importQuestionsFromExcel = async (
  params: ImportQuestionsParams
): Promise<QuestionImportResponse> => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('courseId', String(params.courseId));

  if (params.lessonId != null) {
    formData.append('lessonId', String(params.lessonId));
  }
  if (params.defaultQuestionType) {
    formData.append('defaultQuestionType', params.defaultQuestionType);
  }

  const response = await api.post<RequestResponse<QuestionImportResponse>>(
    '/questions/import-excel',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

/**
 * Tải file Excel mẫu dưới dạng Blob.
 * GET /api/questions/import-template
 */
export const downloadImportTemplate = async (): Promise<Blob> => {
  try {
    const response = await api.get('/questions/import-template', {
      responseType: 'blob',
    });
    return response.data;
  } catch (err: any) {
    // Nếu lỗi và response là blob → convert về JSON để đọc message
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || 'Tải file mẫu thất bại');
      } catch {
        throw new Error('Tải file mẫu thất bại');
      }
    }
    throw err;
  }
};

/**
 * Helper: tải file mẫu và tự động trigger download.
 */
export const downloadAndSaveImportTemplate = async (
  fileName: string = 'question_import_template.xlsx'
): Promise<void> => {
  const blob = await downloadImportTemplate();

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ==================== C. QUIZ ATTEMPT ====================

/**
 * Bắt đầu làm bài.
 * POST /api/quizzes/{quizId}/attempts
 *
 * BE trả về:
 *  - status = IN_PROGRESS
 *  - questions[] = learner view (KHÔNG có correctAnswer)
 *  - answers = JSON chứa questionIds snapshot
 */
export const startAttempt = async (
  quizId: number
): Promise<QuizAttempt> => {
  const response = await api.post<RequestResponse<QuizAttempt>>(
    `/quizzes/${quizId}/attempts`
  );
  return response.data.data;
};

/**
 * Lưu tạm câu trả lời.
 * PUT /api/attempts/{attemptId}/answers
 */
export const saveAnswers = async (
  attemptId: number,
  data: SaveAnswersRequest
): Promise<QuizAttempt> => {
  const response = await api.put<RequestResponse<QuizAttempt>>(
    `/attempts/${attemptId}/answers`,
    data
  );
  return response.data.data;
};

/**
 * Submit bài làm.
 * POST /api/attempts/{attemptId}/submit
 *
 * BE trả về:
 *  - status = GRADED
 *  - score, maxScore, isPassed
 *  - questions[] giờ có correctAnswer + explanation để review
 */
export const submitAttempt = async (
  attemptId: number
): Promise<QuizAttempt> => {
  const response = await api.post<RequestResponse<QuizAttempt>>(
    `/attempts/${attemptId}/submit`
  );
  return response.data.data;
};

/**
 * Xem kết quả 1 attempt.
 * GET /api/attempts/{attemptId}
 *
 * - IN_PROGRESS → learner view (không đáp án).
 * - GRADED/TIMEOUT → có đáp án để review.
 */
export const getAttemptResult = async (
  attemptId: number
): Promise<QuizAttempt> => {
  const response = await api.get<RequestResponse<QuizAttempt>>(
    `/attempts/${attemptId}`
  );
  return response.data.data;
};

/**
 * Lịch sử làm bài của user hiện tại cho 1 quiz.
 * GET /api/quizzes/{quizId}/attempts/mine
 * [STUDENT / self]
 */
export const getMyAttempts = async (
  quizId: number
): Promise<QuizAttempt[]> => {
  const response = await api.get<RequestResponse<QuizAttempt[]>>(
    `/quizzes/${quizId}/attempts/mine`
  );
  return response.data.data;
};

/**
 * [ADMIN / TEACHER ONLY] Lấy tất cả attempt của quiz.
 * GET /api/quizzes/{quizId}/attempts
 *
 * BE yêu cầu: instructor của course hoặc admin.
 * Student gọi → 403 Forbidden.
 */
export const getAttemptsByQuiz = async (
  quizId: number
): Promise<QuizAttempt[]> => {
  const response = await api.get<RequestResponse<QuizAttempt[]>>(
    `/quizzes/${quizId}/attempts`
  );
  return response.data.data;
};