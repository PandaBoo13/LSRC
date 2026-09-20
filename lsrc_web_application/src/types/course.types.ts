// ============================================
// src/types/course.types.ts - FIXED
// ============================================

export interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  
  // ✅ THÊM BACKGROUND
  backgroundThumbnail?: string;
  backgroundType?: 'GRADIENT' | 'PATTERN' | 'IMAGE' | 'SOLID';
  
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  duration?: string;
  price: number;
  oldPrice?: number;
  isFree: boolean;
  hasCertificate: boolean;
  accessPeriod: string;
  outcomes?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  courseType?: 'SELF_PACED' | 'LIVE';
  progressType?: 'COMPLETION_BASED' | 'WEIGHTED_GRADE';
  publishedAt?: string;
  instructor: InstructorInfo;
  category?: CategoryInfo;
  totalStudents: number;
  totalLessons: number;
  averageRating?: number;
  language?: string;
  createdAt: string;
  updatedAt: string;
  prerequisite?: PrerequisiteInfo;
}

export interface PrerequisiteInfo {
  id: number;
  title: string;
  slug: string;
  isRequired: boolean;
}

export interface InstructorInfo {
  id: number;
  firstName: string;
  lastName: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

// ==================== REQUEST ====================

export interface CourseRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  thumbnail?: File;
  
  // ✅ THÊM BACKGROUND
  backgroundThumbnail?: string;
  backgroundType?: string; // GRADIENT, PATTERN, IMAGE, SOLID
  
  level?: string;
  duration?: string;
  price?: number;
  oldPrice?: number;
  isFree?: boolean;
  hasCertificate?: boolean;
  accessPeriod?: string;
  outcomes?: string;
  categoryId?: string;
  accountId?: number;
  prerequisiteCourseId?: number | null;
  courseType?: string;
  progressType?: string;
  language?: string;
}

export interface CourseSearchRequest {
  keyword?: string;
  status?: string;
  categoryId?: string;
  level?: string;
  isFree?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface CourseStatusRequest {
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
}

// ==================== RESPONSE ====================

export interface RequestResponse<T = any> {
  data: T;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CategoryCourses {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  courses: Course[];
}

export interface HomePageResponse {
  newestCourses: Course[];
  mostPopularCourses: Course[];
  topRatedCourses: Course[];
  freeCourses: Course[];
  discountedCourses: Course[];
  coursesByCategory: CategoryCourses[];
}