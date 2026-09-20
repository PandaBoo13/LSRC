// src/service/categoryService.ts
import api from '../api/axiosConfig';
import type { Category, CategoryRequest, RequestResponse } from '../types/category.types';

/**
 * Lấy cây danh mục
 */
export const getCategoryTree = async (): Promise<Category[]> => {
  const response = await api.get<RequestResponse<Category[]>>('/categories/tree');
  return response.data.data || [];
};

/**
 * Tìm kiếm danh mục
 */
export const searchCategories = async (keyword: string): Promise<Category[]> => {
  const response = await api.get<RequestResponse<Category[]>>(
    `/categories/search?keyword=${encodeURIComponent(keyword)}`
  );
  return response.data.data || [];
};

/**
 * Lấy danh mục theo ID
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const response = await api.get<RequestResponse<Category>>(`/categories/${id}`);
  return response.data.data || null;
};

/**
 * Tạo danh mục mới
 */
export const createCategory = async (data: CategoryRequest): Promise<void> => {
  await api.post<RequestResponse>('/categories', data);
};

/**
 * Cập nhật danh mục
 */
export const updateCategory = async (id: string, data: CategoryRequest): Promise<void> => {
  await api.put<RequestResponse>(`/categories/${id}`, data);
};

/**
 * Xóa danh mục
 */
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

/**
 * Bật/tắt trạng thái danh mục
 */
export const toggleCategoryStatus = async (id: string): Promise<void> => {
  await api.patch(`/categories/${id}/toggle-status`);
};