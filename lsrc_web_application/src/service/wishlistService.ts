// src/service/wishlistService.ts
import api from '../api/axiosConfig';
import type { WishlistResponse } from '../types/wishlist.types';
import type { PageResponse, RequestResponse } from '../types/course.types';

/**
 * Lấy wishlist của tôi
 * GET /api/wishlist/my-wishlist
 */
export const getMyWishlist = async (
  params?: { page?: number; size?: number }
): Promise<PageResponse<WishlistResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<WishlistResponse>>>(
    '/wishlist/my-wishlist',
    { params }
  );
  return response.data.data;
};

/**
 * Thêm khóa học vào wishlist
 * POST /api/wishlist/{courseId}
 */
export const addToWishlist = async (courseId: number): Promise<WishlistResponse> => {
  const response = await api.post<RequestResponse<WishlistResponse>>(`/wishlist/${courseId}`);
  return response.data.data;
};

/**
 * Xóa khóa học khỏi wishlist
 * DELETE /api/wishlist/{courseId}
 */
export const removeFromWishlist = async (courseId: number): Promise<void> => {
  await api.delete(`/wishlist/${courseId}`);
};

/**
 * Kiểm tra khóa học có trong wishlist không
 * GET /api/wishlist/check/{courseId}
 */
export const checkWishlist = async (courseId: number): Promise<boolean> => {
  const response = await api.get<RequestResponse<boolean>>(`/wishlist/check/${courseId}`);
  return response.data.data;
};

/**
 * Đếm số khóa học trong wishlist
 * GET /api/wishlist/count
 */
export const countWishlist = async (): Promise<number> => {
  const response = await api.get<RequestResponse<number>>('/wishlist/count');
  return response.data.data;
};