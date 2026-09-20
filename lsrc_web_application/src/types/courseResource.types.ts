// src/types/courseResource.types.ts

export interface CourseResource {
  id: number;
  courseId: number;
  chapterId?: number | null;
  parentId?: number | null;
  resourceType: 'VIDEO' | 'QUIZ' | 'PDF' | 'SLIDE' | 'AUDIO' | 'DOCUMENT' | 'IMAGE' | 'LINK' | 'SCORM' | 'OTHER';
  title: string;
  slug?: string;
  description?: string;
  orderIndex: number;
  isRequired: boolean;
  status: 'DRAFT' | 'HIDDEN' | 'PUBLISHED' | 'PROCESSING' | 'READY' | 'ERROR';
  settings?: string;

  // VIDEO lesson
  duration?: number;
  content?: string;
  isFreePreview?: boolean;
  thumbnailUrl?: string;

  // File
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileFormat?: string;
  mimeType?: string;

  // QUIZ
  maxAttempts?: number;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  hashtagFilter?: string;
  totalQuestions?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface CourseResourceRequest {
  title: string;
  slug?: string;
  description?: string;
  resourceType: string;

  // ✅ Cho phép null để gỡ chapter/parent
  chapterId?: number | null;
  parentId?: number | null;

  orderIndex?: number;
  isRequired?: boolean;
  settings?: string;

  /**
   * ✅ FIXED [CRITICAL]: status — cho phép FE đổi trạng thái qua update.
   *
   * Trước đây field này không tồn tại → FE gửi status → service drop → BE ignore → status không đổi.
   * BE enum: DRAFT | HIDDEN | PUBLISHED | PROCESSING | READY | ERROR
   */
  status?: 'DRAFT' | 'HIDDEN' | 'PUBLISHED' | 'PROCESSING' | 'READY' | 'ERROR';

  // VIDEO
  duration?: number;
  content?: string;
  isFreePreview?: boolean;
  thumbnailUrl?: string;

  // File
  fileName?: string;
  fileUrl?: string;
  file?: File;
  fileSize?: number;
  fileFormat?: string;
  mimeType?: string;

  // QUIZ
  maxAttempts?: number;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  hashtagFilter?: string;
  totalQuestions?: number;
}