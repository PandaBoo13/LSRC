// src/utils/progressUtils.ts
import type { ProgressResponse } from '../service/progress/progress.types';
import { PROGRESS_STATUS, isCourseProgress } from '../service/progress/progress.types';

// ==================== TYPES ====================

export interface ProgressOverview {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  averageProgress: number;
  totalTimeSpent: number;
}

// ==================== CALCULATORS ====================

/**
 * Tính tổng quan tiến độ từ danh sách progress.
 * Chỉ tính COURSE progress (bỏ qua RESOURCE progress nếu có).
 */
export const calculateProgressOverview = (
  progresses: ProgressResponse[]
): ProgressOverview => {
  const safeList = Array.isArray(progresses) ? progresses : [];

  // Lọc chỉ COURSE progress (an toàn kép — BE đã filter, nhưng vẫn check)
  const courseProgresses = safeList.filter(isCourseProgress);

  const totalCourses = courseProgresses.length;

  if (totalCourses === 0) {
    return {
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      notStartedCourses: 0,
      averageProgress: 0,
      totalTimeSpent: 0,
    };
  }

  let completedCourses = 0;
  let inProgressCourses = 0;
  let notStartedCourses = 0;
  let totalPercentage = 0;
  let totalTimeSpent = 0;

  for (const p of courseProgresses) {
    switch (p.status) {
      case PROGRESS_STATUS.COMPLETED:
        completedCourses++;
        break;
      case PROGRESS_STATUS.IN_PROGRESS:
        inProgressCourses++;
        break;
      case PROGRESS_STATUS.NOT_STARTED:
        notStartedCourses++;
        break;
      default:
        // Fallback: dựa vào progressPercentage
        if ((p.progressPercentage ?? 0) >= 100) completedCourses++;
        else if ((p.progressPercentage ?? 0) > 0) inProgressCourses++;
        else notStartedCourses++;
    }

    totalPercentage += p.progressPercentage ?? 0;
    totalTimeSpent += p.totalTimeSpent ?? 0;
  }

  const averageProgress =
    totalCourses > 0
      ? Math.round((totalPercentage / totalCourses) * 100) / 100
      : 0;

  return {
    totalCourses,
    completedCourses,
    inProgressCourses,
    notStartedCourses,
    averageProgress,
    totalTimeSpent,
  };
};

/**
 * Tính % hoàn thành trung bình có trọng số (dùng cho dashboard).
 * VD: course 100% + course 50% → average = 75%
 */
export const calculateWeightedAverage = (
  progresses: ProgressResponse[]
): number => {
  const list = (progresses || []).filter(isCourseProgress);
  if (list.length === 0) return 0;

  const total = list.reduce((sum, p) => sum + (p.progressPercentage ?? 0), 0);
  return Math.round((total / list.length) * 100) / 100;
};

/**
 * Đếm số bài học đã hoàn thành trong 1 course.
 * Input: danh sách RESOURCE progress của course đó.
 */
export const countCompletedResources = (
  resourceProgresses: ProgressResponse[]
): number => {
  return (resourceProgresses || []).filter(
    p => p.status === PROGRESS_STATUS.COMPLETED
  ).length;
};

/**
 * Tìm resource progress tiếp theo cần học (chưa completed).
 * Trả về null nếu đã học hết.
 */
export const findNextIncompleteResource = (
  resourceProgresses: ProgressResponse[],
  orderedResourceIds: number[]
): number | null => {
  const completedIds = new Set(
    (resourceProgresses || [])
      .filter(p => p.status === PROGRESS_STATUS.COMPLETED && p.referenceId != null)
      .map(p => p.referenceId as number)
  );

  for (const id of orderedResourceIds) {
    if (!completedIds.has(id)) return id;
  }
  return null;
};

/**
 * Tính tổng thời gian học từ danh sách progress (bất kỳ loại nào).
 * @returns giây
 */
export const sumTotalTimeSpent = (progresses: ProgressResponse[]): number => {
  return (progresses || []).reduce((sum, p) => sum + (p.totalTimeSpent ?? 0), 0);
};

// ==================== FORMATTERS ====================

/**
 * Format thời gian học cho hiển thị (VD: "2g 30p", "45 phút", "30 giây").
 */
export const formatOverviewTimeSpent = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0 phút';

  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}g ${minutes}p`;
  if (hours > 0) return `${hours}g`;
  if (totalMinutes > 0) return `${totalMinutes} phút`;
  return `${seconds} giây`;
};

/**
 * Tính % tiến độ dạng chuỗi.
 */
export const formatOverviewPercentage = (p: ProgressOverview): string => {
  return `${p.averageProgress.toFixed(1)}%`;
};

// ==================== DATE FORMATTERS ====================

/**
 * Format ngày giờ cho hiển thị (VD: "15/09/2026 14:30").
 * @param date Chuỗi ISO / Date object / null
 * @returns Chuỗi đã format, hoặc '-' nếu không hợp lệ
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
};

/**
 * Format ngày ngắn gọn (VD: "15/09/2026").
 */
export const formatDateShort = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  } catch {
    return '-';
  }
};

/**
 * Alias cho `formatOverviewTimeSpent` — giữ tên ngắn gọn cho component.
 */
export const formatTimeSpent = formatOverviewTimeSpent;
// ==================== COLOR HELPERS ====================

/**
 * Trả về Tailwind class màu nền theo % tiến độ.
 * - 100%      → emerald (xanh lá đậm)
 * - 70-99%    → teal (màu chủ đạo #49BBBD)
 * - 40-69%    → amber (vàng)
 * - 1-39%     → orange
 * - 0%        → slate (xám)
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return 'bg-emerald-500';
  if (percentage >= 70)  return 'bg-[#49BBBD]';
  if (percentage >= 40)  return 'bg-amber-500';
  if (percentage > 0)    return 'bg-orange-500';
  return 'bg-slate-300';
};
// ==================== STATUS HELPERS ====================

/**
 * Trả về label tiếng Việt cho status.
 */
export const getStatusLabel = (status: string | null | undefined): string => {
  switch (status) {
    case PROGRESS_STATUS.NOT_STARTED: return 'Chưa bắt đầu';
    case PROGRESS_STATUS.IN_PROGRESS: return 'Đang học';
    case PROGRESS_STATUS.COMPLETED:   return 'Đã hoàn thành';
    case PROGRESS_STATUS.PASSED:      return 'Đã đạt';
    case PROGRESS_STATUS.FAILED:      return 'Chưa đạt';
    default:                          return 'Không xác định';
  }
};

/**
 * Trả về icon (emoji) cho status.
 */
export const getStatusIcon = (status: string | null | undefined): string => {
  switch (status) {
    case PROGRESS_STATUS.COMPLETED:   return '✅';
    case PROGRESS_STATUS.IN_PROGRESS: return '🔄';
    case PROGRESS_STATUS.PASSED:      return '✓';
    case PROGRESS_STATUS.FAILED:      return '✗';
    case PROGRESS_STATUS.NOT_STARTED: return '○';
    default:                          return '○';
  }
};