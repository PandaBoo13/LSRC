// src/types/lessonQuestion.types.ts

export interface LessonQuestionResponse {
  id: number;
  resourceId: number;
  resourceTitle?: string;
  questionId: number;
  questionContent?: string;
  questionType?: string;
  orderIndex: number;
  points: number;
  createdAt?: string;
}

export interface LessonQuestionRequest {
  resourceId: number;
  questionId: number;
  orderIndex?: number;
  points?: number;
}