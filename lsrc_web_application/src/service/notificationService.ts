// src/service/notificationService.ts
import api from '../api/axiosConfig';
import type { RequestResponse, PageResponse } from '../types/course.types';
import type {
  NotificationResponse,
  NotificationRequest,
} from '../types/notification.types';

// ==================== GET ====================

/**
 * Lấy danh sách thông báo của tôi (phân trang)
 * GET /api/notifications?page=0&size=10
 */
export const getMyNotifications = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<NotificationResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<NotificationResponse>>>(
    '/notifications',
    { params: { page, size } }
  );
  return response.data.data;
};

/**
 * Đếm số thông báo chưa đọc
 * GET /api/notifications/unread-count
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get<RequestResponse<number>>('/notifications/unread-count');
  return response.data.data;
};

// ==================== ACTIONS ====================

/**
 * Đánh dấu 1 thông báo đã đọc
 * PUT /api/notifications/{notificationId}/read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

/**
 * [ADMIN] Gửi thông báo
 * POST /api/notifications/send
 */
export const sendNotification = async (
  data: NotificationRequest
): Promise<void> => {
  await api.post('/notifications/send', data);
};

// ==================== DELETE ====================

/**
 * Xóa 1 thông báo của user
 * DELETE /api/notifications/{notificationId}
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

/**
 * ✅ Xóa TẤT CẢ thông báo của user hiện tại
 * DELETE /api/notifications/all
 */
export const deleteAllNotifications = async (): Promise<void> => {
  await api.delete('/notifications/all');
};