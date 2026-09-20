// src/types/rbac.types.ts

/**
 * Cấu trúc Response chuẩn phản hồi từ backend API
 */
export interface RequestResponse<T = any> {
  data: T;
  message: string;
  status?: number;
}

/**
 * Thông tin chi tiết cá nhân người dùng
 */
export interface UserInfo {
  idAccount: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  provider?: string;
  // Thông tin mở rộng
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  updatedAt?: string | null;
}

/**
 * DTO Yêu cầu cập nhật hồ sơ cá nhân
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}