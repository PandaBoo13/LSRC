// src/service/authService.ts
import api from '../api/axiosConfig';
import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserInfoResponse,
  RequestResponse
} from '../types/auth.types';

/**
 * Đăng nhập
 * POST /api/auth/login
 */
export const login = (credentials: LoginRequest) => {
  return api.post<RequestResponse>('/auth/login', credentials, {
    withCredentials: true
  });
};

/**
 * Đăng ký tài khoản mới
 * POST /api/auth/register
 */
export const register = (userData: RegisterRequest) => {
  return api.post<RequestResponse>('/auth/register', userData);
};

/**
 * Làm mới access token - Dùng axios trực tiếp để tránh interceptor
 * POST /api/auth/refresh-token
 */
export const refreshToken = () => {
  return axios.post<RequestResponse>(
    'http://localhost:8080/api/auth/refresh-token',
    {},
    { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
};

/**
 * Đăng xuất
 * POST /api/auth/logout
 */
export const logout = () => {
  return api.post<RequestResponse>('/auth/logout', {}, {
    withCredentials: true
  });
};

/**
 * Lấy thông tin user hiện tại
 * GET /api/auth/me
 */
export const getMe = () => {
  return api.get<RequestResponse>('/auth/me', {
    withCredentials: true
  });
};

/**
 * Kiểm tra token còn hiệu lực không
 * GET /api/auth/check-token
 */
export const checkAuth = () => {
  return api.get<RequestResponse>('/auth/check-token', {
    withCredentials: true
  });
};

// ==================== FORGOT PASSWORD (3 BƯỚC) ====================

/**
 * Bước 1: Quên mật khẩu - Gửi OTP qua email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = (email: string) => {
  return api.post<RequestResponse>('/auth/forgot-password', { email });
};

/**
 * Bước 2: Xác thực OTP
 * POST /api/auth/verify-otp
 */
export const verifyOtp = (email: string, otp: string) => {
  return api.post<RequestResponse>('/auth/verify-otp', { email, otp });
};

/**
 * Bước 3: Đặt lại mật khẩu mới
 * POST /api/auth/reset-password
 */
export const resetPassword = (email: string, newPassword: string) => {
  return api.post<RequestResponse>('/auth/reset-password', {
    email,
    newPassword
  });
};

// ==================== CHANGE PASSWORD ====================

/**
 * Đổi mật khẩu (yêu cầu đã đăng nhập)
 * POST /api/auth/change-password
 */
export const changePassword = (currentPassword: string, newPassword: string) => {
  return api.post<RequestResponse>('/auth/change-password', {
    currentPassword,
    newPassword
  }, {
    withCredentials: true
  });
};

// Export types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserInfoResponse,
  RequestResponse
};