// src/service/courseResourceService.ts
import api from '../api/axiosConfig';
import type { CourseResource, CourseResourceRequest } from '../types/courseResource.types';
import type { RequestResponse } from '../types/course.types';

// ==================== GET ====================

export const getResourcesByCourse = async (courseId: number): Promise<CourseResource[]> => {
  const response = await api.get<RequestResponse<CourseResource[]>>(`/courses/${courseId}/resources`);
  return response.data.data;
};

export const getResourcesByChapter = async (courseId: number, chapterId: number): Promise<CourseResource[]> => {
  const response = await api.get<RequestResponse<CourseResource[]>>(
    `/courses/${courseId}/chapters/${chapterId}/resources`
  );
  return response.data.data;
};

export const getResourcesByParent = async (courseId: number, resourceId: number): Promise<CourseResource[]> => {
  const response = await api.get<RequestResponse<CourseResource[]>>(
    `/courses/${courseId}/resources/${resourceId}/children`
  );
  return response.data.data;
};

export const getResourceById = async (resourceId: number): Promise<CourseResource> => {
  const response = await api.get<RequestResponse<CourseResource>>(`/resources/${resourceId}`);
  return response.data.data;
};

// ==================== CREATE ====================

export const uploadResource = async (
  courseId: number,
  data: CourseResourceRequest
): Promise<CourseResource> => {
  const formData = new FormData();

  if (data.title) formData.append('title', data.title);
  if (data.slug) formData.append('slug', data.slug);
  if (data.description) formData.append('description', data.description);
  if (data.resourceType) formData.append('resourceType', data.resourceType);

  // ✅ NEW: append status nếu có (BE có thể set default DRAFT khi create)
  if (data.status) formData.append('status', data.status);

  if (data.chapterId !== undefined && data.chapterId !== null) {
    formData.append('chapterId', String(data.chapterId));
  }
  if (data.parentId !== undefined && data.parentId !== null) {
    formData.append('parentId', String(data.parentId));
  }

  if (data.orderIndex !== undefined) formData.append('orderIndex', String(data.orderIndex));
  if (data.isRequired !== undefined) formData.append('isRequired', String(data.isRequired));
  if (data.duration !== undefined) formData.append('duration', String(data.duration));
  if (data.content) formData.append('content', data.content);
  if (data.isFreePreview !== undefined) formData.append('isFreePreview', String(data.isFreePreview));
  if (data.thumbnailUrl) formData.append('thumbnailUrl', data.thumbnailUrl);
  if (data.fileUrl) formData.append('fileUrl', data.fileUrl);
  if (data.file) formData.append('file', data.file);

  // Quiz fields
  if (data.maxAttempts !== undefined) formData.append('maxAttempts', String(data.maxAttempts));
  if (data.passingScore !== undefined) formData.append('passingScore', String(data.passingScore));
  if (data.timeLimit !== undefined) formData.append('timeLimit', String(data.timeLimit));
  if (data.shuffleQuestions !== undefined) formData.append('shuffleQuestions', String(data.shuffleQuestions));
  if (data.hashtagFilter) formData.append('hashtagFilter', data.hashtagFilter);
  if (data.totalQuestions !== undefined) formData.append('totalQuestions', String(data.totalQuestions));

  const response = await api.post<RequestResponse<CourseResource>>(
    `/courses/${courseId}/resources/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const addResourceByLink = async (
  courseId: number,
  data: CourseResourceRequest
): Promise<CourseResource> => {
  const response = await api.post<RequestResponse<CourseResource>>(
    `/courses/${courseId}/resources/link`,
    data
  );
  return response.data.data;
};

// ==================== UPDATE ====================

export const updateResource = async (
  courseId: number,
  resourceId: number,
  data: CourseResourceRequest
): Promise<CourseResource> => {
  const formData = new FormData();

  if (data.title) formData.append('title', data.title);
  if (data.slug) formData.append('slug', data.slug);
  if (data.description) formData.append('description', data.description);
  if (data.resourceType) formData.append('resourceType', data.resourceType);

  // ✅ FIXED [CRITICAL]: append `status` — BE mới đổi được trạng thái.
  // Trước đây thiếu dòng này → BE ignore → lesson luôn ở DRAFT.
  if (data.status) {
    formData.append('status', data.status);
  }

  // Xử lý chapterId — cho phép xóa bằng cách gửi chuỗi rỗng
  if (data.chapterId !== undefined && data.chapterId !== null) {
    formData.append('chapterId', String(data.chapterId));
  } else if (data.chapterId === null) {
    formData.append('chapterId', '');
  }

  // Xử lý parentId
  if (data.parentId !== undefined && data.parentId !== null) {
    formData.append('parentId', String(data.parentId));
  } else if (data.parentId === null) {
    formData.append('parentId', '');
  }

  if (data.orderIndex !== undefined) formData.append('orderIndex', String(data.orderIndex));
  if (data.isRequired !== undefined) formData.append('isRequired', String(data.isRequired));
  if (data.duration !== undefined) formData.append('duration', String(data.duration));
  if (data.content) formData.append('content', data.content);
  if (data.isFreePreview !== undefined) formData.append('isFreePreview', String(data.isFreePreview));
  if (data.thumbnailUrl) formData.append('thumbnailUrl', data.thumbnailUrl);
  if (data.fileUrl) formData.append('fileUrl', data.fileUrl);
  if (data.file) formData.append('file', data.file);

  if (data.maxAttempts !== undefined) formData.append('maxAttempts', String(data.maxAttempts));
  if (data.passingScore !== undefined) formData.append('passingScore', String(data.passingScore));
  if (data.timeLimit !== undefined) formData.append('timeLimit', String(data.timeLimit));
  if (data.shuffleQuestions !== undefined) formData.append('shuffleQuestions', String(data.shuffleQuestions));
  if (data.hashtagFilter) formData.append('hashtagFilter', data.hashtagFilter);
  if (data.totalQuestions !== undefined) formData.append('totalQuestions', String(data.totalQuestions));

  const response = await api.put<RequestResponse<CourseResource>>(
    `/courses/${courseId}/resources/${resourceId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

// ✅ Cập nhật chapter cho resource (dùng JSON body)
export const updateResourceChapter = async (
  courseId: number,
  resourceId: number,
  chapterId: number | null
): Promise<CourseResource> => {
  const response = await api.put<RequestResponse<CourseResource>>(
    `/courses/${courseId}/resources/${resourceId}/chapter`,
    { chapterId },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data.data;
};

// ==================== DELETE ====================

export const deleteResource = async (courseId: number, resourceId: number): Promise<void> => {
  await api.delete(`/courses/${courseId}/resources/${resourceId}`);
};

// ==================== STATUS ====================

export const publishResource = async (resourceId: number): Promise<CourseResource> => {
  const response = await api.put<RequestResponse<CourseResource>>(`/resources/${resourceId}/publish`);
  return response.data.data;
};

export const unpublishResource = async (resourceId: number): Promise<CourseResource> => {
  const response = await api.put<RequestResponse<CourseResource>>(`/resources/${resourceId}/unpublish`);
  return response.data.data;
};