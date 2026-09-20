// ============================================
// src/service/quiz/quiz.types.ts
// ============================================

/**
 * ============================================================
 * QUIZ TYPES — đồng bộ với BE DTO
 * ============================================================
 */

// ==================== QUIZ ENTITY ====================

export interface Quiz {
  quizId: number;
  courseId: number;
  title: string;
  description?: string | null;
  resourceType?: string;
  timeLimit?: number | null;
  maxAttempts?: number;
  passingScore?: number;
  totalQuestions?: number;
  isPublished?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== QUESTION TYPES ====================
// Re-export từ question.types để có 1 nguồn sự thật

export type {
  Question,
  QuestionLearner,
  QuestionRequest,
  PageResponse,
} from '../../types/question.types';

// ==================== QUIZ ATTEMPT ====================

export interface QuizOptionItem {
  label: string;
  content: string;
}

export interface QuizQuestionItem {
  questionId: number;
  content: string;
  questionType: string;
  options?: QuizOptionItem[];
  points?: number;
  orderIndex?: number;
  /** Chỉ có khi attempt đã GRADED */
  correctAnswer?: string;
  /** Chỉ có khi attempt đã GRADED */
  explanation?: string;
}

export interface QuizAttempt {
  attemptId: number;
  quizId: number;
  accountId?: number;
  attemptNumber: number;
  status: 'IN_PROGRESS' | 'GRADED' | 'TIMEOUT';
  score: number;
  maxScore: number;
  passingScore?: number;
  isPassed: boolean;
  timeSpent?: number;
  startedAt?: string;
  submittedAt?: string;
  answers?: string;
  questions?: QuizQuestionItem[];
}

// ==================== REQUEST DTOs ====================

export interface CreateQuizRequest {
  title: string;
  description?: string;
  timeLimit?: number | null;
  maxAttempts?: number;
  passingScore?: number;
  orderIndex?: number;
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  timeLimit?: number | null;
  maxAttempts?: number;
  passingScore?: number;
  orderIndex?: number;
}

export interface CreateQuestionRequest {
  courseId: number;
  lessonId?: number | null;
  content: string;
  questionType: string;
  options?: string;
  correctAnswer?: string;
  explanation?: string;
  status?: string;
  orderIndex?: number;
  points?: number;
}

export interface UpdateQuestionRequest {
  courseId?: number;
  lessonId?: number | null;
  content?: string;
  questionType?: string;
  options?: string;
  correctAnswer?: string;
  explanation?: string;
  status?: string;
  orderIndex?: number;
  points?: number;
}

export interface AssignQuestionsRequest {
  questionIds: number[];
}

export interface SaveAnswersRequest {
  answers: string;
}

// ==================== IMPORT EXCEL ====================

export interface QuestionImportItem {
  questionId: number;
  content: string;
  questionType: string;
}

export interface QuestionImportResponse {
  successCount: number;
  failedCount: number;
  errors?: Array<{ row: number; message: string }>;
  importedQuestions?: QuestionImportItem[];
}

export interface ImportQuestionsParams {
  file: File;
  courseId: number;
  lessonId?: number;
  defaultQuestionType?: string;
}