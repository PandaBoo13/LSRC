// src/service/accountService.ts
import api from '../api/axiosConfig';
import type { RequestResponse, UserInfo } from '../types/rbac.types';

/**
 * Lấy tất cả users
 */
export const getAllUsers = async (): Promise<UserInfo[]> => {
  const response = await api.get<RequestResponse>('/accounts');
  return response.data.data;
};

/**
 * Lấy danh sách giáo viên (teachers)
 */
export const getTeachers = async (): Promise<UserInfo[]> => {
  const response = await api.get<RequestResponse>('/accounts/teachers');
  return response.data.data;
};

/**
 * Lấy user theo ID
 */
export const getUserById = async (id: number): Promise<UserInfo> => {
  const response = await api.get<RequestResponse>(`/accounts/${id}`);
  return response.data.data;
};