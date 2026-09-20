// ============================================
// src/service/courseService.ts - FIXED HOÀN CHỈNH
// ============================================
import api from '../api/axiosConfig';
import type {
  Course,
  CourseRequest,
  CourseSearchRequest,
  CourseStatusRequest,
  RequestResponse,
  PageResponse,
  HomePageResponse,
  PrerequisiteInfo
} from '../types/course.types';

// ==================== HELPER ====================

const buildCourseFormData = (data: CourseRequest): FormData => {
  const formData = new FormData();
  
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.thumbnailUrl) formData.append('thumbnailUrl', data.thumbnailUrl);
  
  if (data.backgroundThumbnail) formData.append('backgroundThumbnail', data.backgroundThumbnail);
  if (data.backgroundType) formData.append('backgroundType', data.backgroundType);
  
  if (data.level) formData.append('level', data.level);
  if (data.duration) formData.append('duration', data.duration);
  if (data.price !== undefined && data.price !== null) formData.append('price', String(data.price));
  if (data.oldPrice !== undefined && data.oldPrice !== null) formData.append('oldPrice', String(data.oldPrice));
  if (data.isFree !== undefined) formData.append('isFree', String(data.isFree));
  if (data.hasCertificate !== undefined) formData.append('hasCertificate', String(data.hasCertificate));
  if (data.accessPeriod) formData.append('accessPeriod', data.accessPeriod);
  if (data.outcomes) formData.append('outcomes', data.outcomes);
  if (data.categoryId) formData.append('categoryId', data.categoryId);
  if (data.accountId !== undefined && data.accountId !== null) formData.append('accountId', String(data.accountId));
  if (data.prerequisiteCourseId !== undefined && data.prerequisiteCourseId !== null) 
    formData.append('prerequisiteCourseId', String(data.prerequisiteCourseId));
  if (data.courseType) formData.append('courseType', data.courseType);
  if (data.progressType) formData.append('progressType', data.progressType);
  if (data.language) formData.append('language', data.language);
  if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
  
  return formData;
};

// ✅ Helper: Build FormData từ Course hiện tại + thay đổi
const buildFormDataFromCourse = (
  course: Course, 
  changes: Partial<CourseRequest>
): FormData => {
  const formData = new FormData();
  
  // ✅ Bắt buộc: title
  formData.append('title', changes.title || course.title);
  
  // ✅ Các field khác
  formData.append('description', changes.description || course.description || '');
  formData.append('level', changes.level || course.level || 'ALL_LEVELS');
  formData.append('language', changes.language || course.language || 'vi');
  formData.append('price', String(changes.price ?? course.price ?? 0));
  formData.append('isFree', String(changes.isFree ?? course.isFree ?? false));
  formData.append('hasCertificate', String(changes.hasCertificate ?? course.hasCertificate ?? false));
  formData.append('duration', changes.duration || course.duration || '');
  
  // ✅ Course type
  if (changes.courseType) formData.append('courseType', changes.courseType);
  else if (course.courseType) formData.append('courseType', course.courseType);
  
  // ✅ Progress type
  if (changes.progressType) formData.append('progressType', changes.progressType);
  else if (course.progressType) formData.append('progressType', course.progressType);
  
  // ✅ Access period
  if (changes.accessPeriod) formData.append('accessPeriod', changes.accessPeriod);
  else if (course.accessPeriod) formData.append('accessPeriod', course.accessPeriod);
  
  // ✅ Background
  if (changes.backgroundType !== undefined) formData.append('backgroundType', changes.backgroundType);
  else if (course.backgroundType) formData.append('backgroundType', course.backgroundType);
  
  if (changes.backgroundThumbnail !== undefined) formData.append('backgroundThumbnail', changes.backgroundThumbnail);
  else if (course.backgroundThumbnail) formData.append('backgroundThumbnail', course.backgroundThumbnail);
  
  // ✅ Old price
  if (changes.oldPrice !== undefined) formData.append('oldPrice', String(changes.oldPrice));
  else if (course.oldPrice) formData.append('oldPrice', String(course.oldPrice));
  
  // ✅ Outcomes
  if (changes.outcomes !== undefined) formData.append('outcomes', changes.outcomes);
  else if (course.outcomes) formData.append('outcomes', course.outcomes);
  
  // ✅ Category
  if (changes.categoryId !== undefined) formData.append('categoryId', changes.categoryId);
  else if (course.category?.id) formData.append('categoryId', course.category.id);
  
  // ✅ Prerequisite
  if (changes.prerequisiteCourseId !== undefined) {
    if (changes.prerequisiteCourseId === null || changes.prerequisiteCourseId === undefined) {
      formData.append('prerequisiteCourseId', '');
    } else {
      formData.append('prerequisiteCourseId', String(changes.prerequisiteCourseId));
    }
  }
  
  return formData;
};

// ==================== API CONSTANTS ====================

export const getAllCourses = async (params?: CourseSearchRequest): Promise<PageResponse<Course>> => {
  const response = await api.get<RequestResponse<PageResponse<Course>>>('/courses', { params });
  return response.data.data;
};

export const getCourseById = async (id: number): Promise<Course> => {
  const response = await api.get<RequestResponse<Course>>(`/courses/${id}`);
  return response.data.data;
};

export const getCourseBySlug = async (slug: string): Promise<Course> => {
  const response = await api.get<RequestResponse<Course>>(`/courses/slug/${slug}`);
  return response.data.data;
};

export const getInstructorCourses = async (params?: CourseSearchRequest): Promise<PageResponse<Course>> => {
  const response = await api.get<RequestResponse<PageResponse<Course>>>('/courses/instructor', { params });
  return response.data.data;
};

export const createCourse = async (data: CourseRequest): Promise<void> => {
  const formData = buildCourseFormData(data);
  await api.post<RequestResponse>('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateCourse = async (id: number, data: CourseRequest): Promise<void> => {
  const formData = buildCourseFormData(data);
  if (data.prerequisiteCourseId === null) {
    formData.append('prerequisiteCourseId', '');
  }
  await api.put<RequestResponse>(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteCourse = async (id: number): Promise<void> => {
  await api.delete(`/courses/${id}`);
};

export const updateCourseStatus = async (id: number, data: CourseStatusRequest): Promise<void> => {
  await api.patch(`/courses/${id}/status`, data);
};

export const getHomePageCourses = async (): Promise<HomePageResponse> => {
  const response = await api.get<RequestResponse<HomePageResponse>>('/courses/homepage');
  return response.data.data;
};

export const cloneCourse = async (courseId: number): Promise<Course> => {
  const response = await api.post<RequestResponse<Course>>(`/courses/${courseId}/clone`);
  return response.data.data;
};

export const getPrerequisite = async (courseId: number): Promise<PrerequisiteInfo | null> => {
  const response = await api.get<RequestResponse<Course>>(`/courses/${courseId}`);
  return response.data.data.prerequisite || null;
};

// ✅ FIX: setPrerequisite - Truyền course hiện tại để build FormData đầy đủ
export const setPrerequisite = async (
  courseId: number, 
  prerequisiteCourseId: number | null,
  currentCourse: Course
): Promise<void> => {
  const formData = buildFormDataFromCourse(currentCourse, {
    prerequisiteCourseId,
  });
  
  await api.put<RequestResponse>(`/courses/${courseId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ✅ FIX: removePrerequisite - Truyền course hiện tại
export const removePrerequisite = async (
  courseId: number,
  currentCourse: Course
): Promise<void> => {
  const formData = buildFormDataFromCourse(currentCourse, {
    prerequisiteCourseId: null,
  });
  
  await api.put<RequestResponse>(`/courses/${courseId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const submitCourseReview = async (courseId: number): Promise<void> => {
  await api.post(`/courses/${courseId}/submit-review`);
};