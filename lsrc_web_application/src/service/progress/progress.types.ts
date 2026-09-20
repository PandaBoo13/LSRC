// src/types/progress.types.ts

// ==================== CONSTANTS ====================

/** Loại progress */
export const PROGRESS_TYPE = {
  COURSE: 'COURSE',
  RESOURCE: 'RESOURCE',
} as const;
export type ProgressType = typeof PROGRESS_TYPE[keyof typeof PROGRESS_TYPE];

/** Trạng thái progress */
export const PROGRESS_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
} as const;
export type ProgressStatus = typeof PROGRESS_STATUS[keyof typeof PROGRESS_STATUS];

/** Loại reference (dùng cho RESOURCE progress) */
export const REFERENCE_TYPE = {
  COURSE_RESOURCE: 'course_resource',
} as const;
export type ReferenceType = typeof REFERENCE_TYPE[keyof typeof REFERENCE_TYPE];

/** Loại resource — khớp với CourseResource.ResourceType */
export const RESOURCE_TYPE = {
  VIDEO: 'VIDEO',
  QUIZ: 'QUIZ',
  PDF: 'PDF',
  SLIDE: 'SLIDE',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  IMAGE: 'IMAGE',
  LINK: 'LINK',
  SCORM: 'SCORM',
  OTHER: 'OTHER',
} as const;
export type ResourceType = typeof RESOURCE_TYPE[keyof typeof RESOURCE_TYPE];

// ==================== RESPONSE ====================

export interface ProgressResponse {
  id: number;

  // Ownership
  accountId: number;
  username?: string | null;

  // Course info
  courseId: number;
  courseTitle?: string | null;
  courseSlug?: string | null;

  // Phân loại progress
  progressType: ProgressType;
  referenceId?: number | null;
  referenceType?: ReferenceType | string | null;

  // Trạng thái chung
  status: ProgressStatus | string;
  progressPercentage: number;
  totalTimeSpent: number;

  // Quiz/resource score (BigDecimal ở BE → number)
  score?: number | null;
  maxScore?: number | null;
  attempts?: number | null;
  isPassed?: boolean | null;
  notes?: string | null;

  // COURSE progress
  totalItems?: number | null;
  completedItems?: number | null;
  weightedScore?: number | null;
  totalWeightPercent?: number | null;

  // Dữ liệu mở rộng (JSON string hoặc object)
  extraData?: string | Record<string, unknown> | null;

  // Timestamps (ISO 8601)
  startedAt?: string | null;
  completedAt?: string | null;
  lastAccessedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// ==================== REQUEST ====================

export interface ProgressUpdateRequest {
  /** % tiến độ, từ 0 đến 100 */
  progress: number;
  /** Optional — thời gian học (giây), dùng khi gọi updateResourceProgress */
  timeSpent?: number;
}

export interface ProgressTimeSpentRequest {
  /** Thời gian học (giây), phải >= 0 */
  timeSpent: number;
}

export interface ProgressScoreRequest {
  score?: number;
  maxScore?: number;
  isPassed?: boolean;
}

// ==================== HELPER: STATUS ====================

/** Kiểm tra progress đã hoàn thành chưa */
export const isProgressCompleted = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.status === PROGRESS_STATUS.COMPLETED;

/** Kiểm tra progress đang học */
export const isProgressInProgress = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.status === PROGRESS_STATUS.IN_PROGRESS;

/** Kiểm tra progress chưa bắt đầu */
export const isProgressNotStarted = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.status === PROGRESS_STATUS.NOT_STARTED;

/** Kiểm tra progress đã pass (quiz) */
export const isProgressPassed = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.isPassed === true;

/** Kiểm tra progress fail (quiz) */
export const isProgressFailed = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.isPassed === false;

// ==================== HELPER: TYPE ====================

/** Kiểm tra là COURSE progress */
export const isCourseProgress = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.progressType === PROGRESS_TYPE.COURSE;

/** Kiểm tra là RESOURCE progress */
export const isResourceProgress = (p: ProgressResponse | null | undefined): boolean =>
  !!p && p.progressType === PROGRESS_TYPE.RESOURCE;

// ==================== HELPER: DISPLAY ====================

/** Label tiếng Việt cho status */
export const getProgressStatusLabel = (status: ProgressStatus | string | null | undefined): string => {
  switch (status) {
    case PROGRESS_STATUS.NOT_STARTED:
      return 'Chưa bắt đầu';
    case PROGRESS_STATUS.IN_PROGRESS:
      return 'Đang học';
    case PROGRESS_STATUS.COMPLETED:
      return 'Đã hoàn thành';
    case PROGRESS_STATUS.PASSED:
      return 'Đã đạt';
    case PROGRESS_STATUS.FAILED:
      return 'Chưa đạt';
    default:
      return 'Không xác định';
  }
};

/** Màu badge cho status (Tailwind class) */
export const getProgressStatusColor = (
  status: ProgressStatus | string | null | undefined
): { bg: string; text: string; border: string } => {
  switch (status) {
    case PROGRESS_STATUS.COMPLETED:
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
    case PROGRESS_STATUS.IN_PROGRESS:
      return { bg: 'bg-[#49BBBD]/10', text: 'text-[#49BBBD]', border: 'border-[#49BBBD]/30' };
    case PROGRESS_STATUS.PASSED:
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
    case PROGRESS_STATUS.FAILED:
      return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' };
  }
};

/** Format % tiến độ (làm tròn) */
export const formatProgressPercentage = (p: ProgressResponse | null | undefined): string => {
  if (!p) return '0%';
  const value = p.progressPercentage ?? 0;
  return `${Math.round(value)}%`;
};

/** Format thời gian học (giây → chuỗi người đọc được) */
export const formatTimeSpent = (seconds: number | null | undefined): string => {
  if (!seconds || seconds <= 0) return '0 phút';
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}g ${minutes}p` : `${hours}g`;
  }
  return `${minutes} phút`;
};

// ==================== TYPE GUARD ====================

/** Type guard cho ProgressResponse */
export const isProgressResponse = (value: unknown): value is ProgressResponse => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    typeof v.accountId === 'number' &&
    typeof v.courseId === 'number' &&
    typeof v.progressType === 'string' &&
    typeof v.status === 'string'
  );
};

/** Filter list progress theo type */
export const filterCourseProgress = (list: ProgressResponse[]): ProgressResponse[] =>
  list.filter(isCourseProgress);

export const filterResourceProgress = (list: ProgressResponse[]): ProgressResponse[] =>
  list.filter(isResourceProgress);

/** Tìm resource progress theo referenceId */
export const findResourceProgress = (
  list: ProgressResponse[],
  resourceId: number
): ProgressResponse | undefined =>
  list.find(p => isResourceProgress(p) && p.referenceId === resourceId);

  // ==================== UI COMPONENT PROPS ====================

export interface ProgressBarProps {
  /** % từ 0 đến 100 */
  percentage: number;
  /** Hiển thị label % bên cạnh */
  showLabel?: boolean;
  /** Kích thước thanh */
  size?: 'sm' | 'md' | 'lg';
  /** Override màu — Tailwind class như 'bg-green-500' */
  color?: string;
  /** Class bổ sung cho wrapper */
  className?: string;
  /** Hiệu ứng pulse khi đang loading */
  animated?: boolean;
}
// ==================== UI COMPONENT PROPS ====================

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

// ==================== INSTRUCTOR / ADMIN ====================

/**
 * Params cho API instructor xem progress học viên.
 * Dùng cho endpoint: /progress/instructor/course/{courseId}/student/{studentId}
 */
export interface StudentProgressQuery {
  courseId: number;
  studentId: number;
}