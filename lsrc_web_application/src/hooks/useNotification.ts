// src/hooks/useNotification.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getMyNotifications, 
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../service/notificationService';
import { websocketService } from '../service/websocketService';
import type { NotificationResponse } from '../types/notification.types';

export const useNotification = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const notificationsRef = useRef<NotificationResponse[]>([]);

  // ==================== FETCH NOTIFICATIONS ====================
  const fetchNotifications = useCallback(async (page: number = 0) => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    try {
      const data = await getMyNotifications(page, 10);
      setNotifications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
      notificationsRef.current = data.content || [];
    } catch (err) {
      console.error('Lỗi tải notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // ==================== FETCH UNREAD COUNT ====================
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Lỗi đếm unread notifications:', err);
    }
  }, [isAuthenticated, user]);

  // ==================== INIT + SUBSCRIBE ====================
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch dữ liệu ban đầu
      fetchNotifications(0);
      fetchUnreadCount();

      // ✅ Subscribe WebSocket để nhận notification realtime
      websocketService.subscribeToNotifications((newNotification: NotificationResponse) => {
        console.log('🔔 Nhận notification realtime:', newNotification);

        // Thêm vào đầu danh sách
        setNotifications(prev => [newNotification, ...prev]);

        // Tăng unread count
        setUnreadCount(prev => prev + 1);
      });
    }
  }, [isAuthenticated, user, fetchNotifications, fetchUnreadCount]);

  // ==================== MARK AS READ ====================
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);

      // Cập nhật state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  }, []);

  // ==================== MARK ALL AS READ ====================
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();

      // Cập nhật state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  }, []);

  // ==================== PAGINATION ====================
  const goToPage = useCallback((page: number) => {
    fetchNotifications(page);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    totalPages,
    currentPage,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    goToPage,
    isEmpty: !loading && notifications.length === 0,
  };
};