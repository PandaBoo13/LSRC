// ============================================
// NotificationToastContainer.tsx - FIXED
// ============================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { websocketService } from '../../service/websocketService';
import type { NotificationResponse } from '../../types/notification.types';

interface ToastItem {
  id: string;
  notification: NotificationResponse;
}

export const NotificationToastContainer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
    
    const timer = timersRef.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(toastId);
    }
  }, []);

  const handleNewNotification = useCallback((notification: NotificationResponse) => {
    console.log('🔔 [Toast] Nhận notification mới:', notification);
    
    // ✅ Kiểm tra notification hợp lệ
    if (!notification || !notification.title) {
      console.warn('⚠️ [Toast] Notification không hợp lệ');
      return;
    }

    const toastId = `toast-${notification.id}-${Date.now()}`;
    const newToast: ToastItem = { id: toastId, notification };

    setToasts(prev => [newToast, ...prev].slice(0, 3));

    const timer = setTimeout(() => {
      removeToast(toastId);
    }, 5000);

    timersRef.current.set(toastId, timer);
  }, [removeToast]);

  useEffect(() => {
    console.log('🔍 [Toast] useEffect chạy - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('⚠️ [Toast] User chưa đăng nhập, bỏ qua');
      return;
    }

    // ✅ Connect WebSocket
    console.log('🔌 [Toast] Kiểm tra WebSocket - Connected:', websocketService.isConnected());
    
    if (!websocketService.isConnected()) {
      console.log('🔌 [Toast] Đang connect WebSocket...');
      websocketService.connect();
    }

    // ✅ FIX: Lưu hàm cleanup unsubscribe do websocketService trả về
    console.log('📡 [Toast] Đăng ký nhận notifications...');
    const unsubscribe = websocketService.subscribeToNotifications(handleNewNotification);

    // ✅ Debug sau 3 giây
    const debugTimer = setTimeout(() => {
      console.log('🔍 [Toast] Debug sau 3s:');
      console.log('  - Connected:', websocketService.isConnected());
    }, 3000);

    return () => {
      clearTimeout(debugTimer);
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
      
      // ✅ FIX: Hủy đăng ký listener khi component unmount hoặc re-render
      unsubscribe();
    };
  }, [isAuthenticated, handleNewNotification]);

  if (!isAuthenticated || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md bg-white/95 border-cyan-200"
        >
          <span className="flex-shrink-0 mt-0.5">
            <FaBell className="text-[#49BBBD] text-lg" />
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {toast.notification.title}
            </p>
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
              {toast.notification.content}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition"
            title="Đóng"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};