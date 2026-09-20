// src/types/quiz.types.ts

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  showResultImmediately?: boolean;
  shuffleQuestions?: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  courseId: number;
  courseTitle?: string;
  hashtagFilter?: string;
  totalQuestions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizRequest {
  courseId: number;
  title: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
  showResultImmediately?: boolean;
  shuffleQuestions?: boolean;
  status?: string;
  hashtagFilter?: string;
  totalQuestions?: number;
}

// src/types/quiz.types.ts

// Thêm type cho kết quả quiz
export interface QuizAttemptResult {
  quizId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passingScore: number;
  isPassed: boolean;
  timeSpent?: number;
  submittedAt?: string;
}