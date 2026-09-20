// src/service/lecturerService.ts
import api from '../api/axiosConfig';
import type {
  LecturerProfileResponse,
  LecturerProfileRequest,
} from '../types/lecturer.types';
import type { RequestResponse, PageResponse } from '../types/course.types';

// ==================== LECTURER ====================

/**
 * Lấy hồ sơ của chính mình (giảng viên đang đăng nhập)
 * GET /api/lecturer-profiles/my-profile
 */
export const getMyLecturerProfile = async (): Promise<LecturerProfileResponse> => {
  const response = await api.get<RequestResponse<LecturerProfileResponse>>('/lecturer-profiles/my-profile');
  return response.data.data;
};

// ==================== ADMIN ====================

/**
 * Lấy danh sách tất cả hồ sơ giảng viên
 * GET /api/lecturer-profiles
 */
export const getAllLecturers = async (
  params?: { keyword?: string; page?: number; size?: number }
): Promise<PageResponse<LecturerProfileResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<LecturerProfileResponse>>>(
    '/lecturer-profiles',
    { params }
  );
  return response.data.data;
};

/**
 * Tìm kiếm giảng viên theo chuyên môn
 * GET /api/lecturer-profiles/search
 */
export const searchLecturers = async (
  keyword: string,
  params?: { page?: number; size?: number }
): Promise<PageResponse<LecturerProfileResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<LecturerProfileResponse>>>(
    '/lecturer-profiles/search',
    { params: { keyword, ...params } }
  );
  return response.data.data;
};

/**
 * Lấy hồ sơ theo ID
 * GET /api/lecturer-profiles/{id}
 */
export const getLecturerById = async (id: number): Promise<LecturerProfileResponse> => {
  const response = await api.get<RequestResponse<LecturerProfileResponse>>(`/lecturer-profiles/${id}`);
  return response.data.data;
};

/**
 * Lấy hồ sơ theo Account ID
 * GET /api/lecturer-profiles/my-profile (dùng cho chính mình)
 * Hoặc dùng getLecturerById nếu biết profile ID
 */
export const getLecturerByAccountId = async (accountId: number): Promise<LecturerProfileResponse> => {
  const response = await api.get<RequestResponse<LecturerProfileResponse>>(
    `/lecturer-profiles/account/${accountId}`
  );
  return response.data.data;
};

/**
 * Tạo hồ sơ giảng viên
 * POST /api/lecturer-profiles
 */
export const createLecturerProfile = async (
  data: LecturerProfileRequest
): Promise<LecturerProfileResponse> => {
  const response = await api.post<RequestResponse<LecturerProfileResponse>>(
    '/lecturer-profiles',
    data
  );
  return response.data.data;
};

/**
 * Cập nhật hồ sơ giảng viên
 * PUT /api/lecturer-profiles/{id}
 */
export const updateLecturerProfile = async (
  id: number,
  data: LecturerProfileRequest
): Promise<LecturerProfileResponse> => {
  const response = await api.put<RequestResponse<LecturerProfileResponse>>(
    `/lecturer-profiles/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Vô hiệu hóa giảng viên (Admin)
 * PUT /api/lecturer-profiles/{id}/deactivate
 */
export const deactivateLecturer = async (id: number): Promise<void> => {
  await api.put(`/lecturer-profiles/${id}/deactivate`);
};

/**
 * Kích hoạt giảng viên (Admin)
 * PUT /api/lecturer-profiles/{id}/activate
 */
export const activateLecturer = async (id: number): Promise<void> => {
  await api.put(`/lecturer-profiles/${id}/activate`);
};