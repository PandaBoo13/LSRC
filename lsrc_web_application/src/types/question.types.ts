// src/types/question.types.ts

/**
 * ============================================================
 * QUESTION TYPES
 * ============================================================
 * - `Question`        : full view — admin/instructor (có đáp án)
 * - `QuestionLearner` : learner view — student (KHÔNG có đáp án)
 * - `QuestionRequest` : request DTO khi tạo/cập nhật câu hỏi
 * - `PageResponse<T>` : response phân trang từ BE
 * ============================================================
 */

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER';

export type QuestionStatus = 'ACTIVE' | 'INACTIVE';

// ==================== FULL VIEW (admin/instructor) ====================

export interface Question {
  id: number;
  courseId: number;
  courseTitle?: string;
  // ✅ Lesson reference
  lessonId?: number | null;
  lessonTitle?: string | null;
  content: string;
  questionType: QuestionType;
  options?: string;
  correctAnswer?: string;
  explanation?: string;
  status: QuestionStatus;
  orderIndex?: number;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== LEARNER VIEW (không lộ đáp án) ====================

/**
 * Learner view — KHÔNG có `correctAnswer` + `explanation`.
 *
 * FIXED [CRITICAL]: BE đã tách DTO learner.
 * Các endpoint learner trả type này — đảm bảo không lộ đáp án trước khi thi.
 */
export interface QuestionLearner {
  id: number;
  courseId: number;
  courseTitle?: string;
  lessonId?: number | null;
  lessonTitle?: string | null;
  content: string;
  questionType: QuestionType;
  options?: string;
  status: QuestionStatus;
  orderIndex?: number;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
  // KHÔNG có correctAnswer
  // KHÔNG có explanation
}

// ==================== REQUEST DTO ====================

export interface QuestionRequest {
  courseId: number;
  lessonId?: number | null;
  content: string;
  questionType: QuestionType;
  options?: string;
  correctAnswer?: string;
  explanation?: string;
  status?: QuestionStatus;
  orderIndex?: number;
  points?: number;
}

// ==================== PAGINATION ====================

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty?: boolean;
}