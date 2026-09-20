// src/service/userService.ts
import api from '../api/axiosConfig';
import type { RequestResponse, UserInfo, UpdateProfileRequest } from '../types/user.types';

/**
 * Lấy profile cá nhân
 * GET /api/users/profile
 */
export const getUserProfile = async (): Promise<UserInfo> => {
  const response = await api.get<RequestResponse<UserInfo>>('/users/profile');
  return response.data.data;
};

/**
 * Cập nhật profile
 * PUT /api/users/profile
 */
export const updateUserProfile = async (data: UpdateProfileRequest): Promise<UserInfo> => {
  const response = await api.put<RequestResponse<UserInfo>>('/users/profile', data);
  return response.data.data;
};

/**
 * Upload avatar
 * POST /api/users/avatar
 */
export const updateUserAvatar = async (file: File): Promise<UserInfo> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<RequestResponse<UserInfo>>('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

/**
 * Import danh sách học viên từ file Excel (.xlsx / .xls)
 * POST /api/users/import-students
 */
export const importStudents = async (file: File): Promise<RequestResponse<void>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<RequestResponse<void>>('/users/import-students', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Lấy profile của user khác theo accountId
 * GET /api/users/{accountId}/profile
 */
export const getUserProfileById = async (accountId: number): Promise<UserInfo> => {
  const response = await api.get<RequestResponse<UserInfo>>(`/users/${accountId}/profile`);
  return response.data.data;
};