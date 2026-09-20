// src/components/common/NotificationBell/NotificationBell.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell, FaSpinner } from 'react-icons/fa';
import { websocketService } from '../../../service/websocketService';
import { useAuth } from '../../../context/AuthContext';   // ✅ ADD
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../../../service/notificationService';
import { NotificationItem } from './NotificationItem';
import type { NotificationItem as NotificationItemType, NotificationBellProps } from './types';

const PAGE_SIZE = 20;
const MAX_ITEMS = 300;

export function NotificationBell({
  maxItems = MAX_ITEMS,
  onItemClick,
}: NotificationBellProps) {
  // ✅ Lấy auth state
  const { isAuthenticated, user } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [authReady, setAuthReady] = useState(false);

  const receivedIdsRef = useRef<Set<number | string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Đợi auth sẵn sàng
  useEffect(() => {
    if (isAuthenticated && user?.idAccount) {
      setAuthReady(true);
    } else {
      setAuthReady(false);
    }
  }, [isAuthenticated, user?.idAccount]);

  // ==================== LOAD PAGE ====================
  const loadPage = useCallback(async (page: number, reset = false) => {
    // ✅ Guard: chưa login thì bỏ qua
    if (!isAuthenticated || !user?.idAccount) {
      console.log('⏸️ [Notify] Chưa auth — bỏ qua load');
      return;
    }

    if (page === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const pageData = await getMyNotifications(page, PAGE_SIZE);

      console.log(`📥 [Notify] page=${page} → ${pageData?.content?.length ?? 0} items`);

      const newItems: NotificationItemType[] = (pageData.content || []).map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt,
        link: (n as any).link,
        read: n.isRead ?? false,
      }));

      if (reset) {
        receivedIdsRef.current.clear();
        newItems.forEach((n) => {
          if (n.id !== undefined) receivedIdsRef.current.add(n.id);
        });
        setNotifications(newItems);
      } else {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = newItems.filter((n) => !existingIds.has(n.id));
          filtered.forEach((n) => {
            if (n.id !== undefined) receivedIdsRef.current.add(n.id);
          });
          return [...prev, ...filtered];
        });
      }

      setHasMore(newItems.length === PAGE_SIZE);
      setCurrentPage(page);
    } catch (err: any) {
      const status = err?.response?.status;
      console.error(`❌ [Notify] Load page ${page} thất bại (status=${status}):`, err);
      // Nếu 401 → auth chưa ready, không set state
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isAuthenticated, user?.idAccount]);

  // ==================== RELOAD ====================
  const reloadList = useCallback(async () => {
    if (!isAuthenticated || !user?.idAccount) return;

    await loadPage(0, true);
    try {
      const unread = await getUnreadNotificationCount();
      setUnreadCount(unread);
    } catch (err) {
      console.error('❌ [Notify] Lỗi lấy unread count:', err);
    }
  }, [loadPage, isAuthenticated, user?.idAccount]);

  // ==================== LOAD BAN ĐẦU — CHỜ AUTH ====================
  useEffect(() => {
    // ✅ Chỉ load khi auth ready
    if (!authReady) {
      console.log('⏸️ [Notify] Chờ auth ready...');
      return;
    }

    let cancelled = false;

    const loadInitial = async () => {
      setLoading(true);
      try {
        const [pageData, unread] = await Promise.all([
          getMyNotifications(0, PAGE_SIZE),
          getUnreadNotificationCount(),
        ]);

        if (cancelled) return;

        console.log(`✅ [Notify] Initial load: ${pageData?.content?.length ?? 0} items, unread=${unread}`);

        const mapped: NotificationItemType[] = (pageData.content || []).map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          createdAt: n.createdAt,
          link: (n as any).link,
          read: n.isRead ?? false,
        }));

        mapped.forEach((n) => {
          if (n.id !== undefined) receivedIdsRef.current.add(n.id);
        });

        setNotifications(mapped);
        setUnreadCount(unread);
        setHasMore(mapped.length === PAGE_SIZE);
        setCurrentPage(0);
      } catch (err) {
        console.error('❌ [Notify] Lỗi load initial:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitial();
    return () => { cancelled = true; };
  }, [authReady]);   // ✅ deps = authReady

  // ==================== WEBSOCKET — CHỜ AUTH ====================
  useEffect(() => {
    if (!authReady) return;

    const unsubscribe = websocketService.subscribeToNotifications((data: any) => {
      const notifId = data?.id ?? Date.now();

      if (receivedIdsRef.current.has(notifId)) return;
      receivedIdsRef.current.add(notifId);

      const notif: NotificationItemType = {
        id: notifId,
        title: data?.title || 'Thông báo',
        content: data?.content || '',
        createdAt: data?.createdAt || new Date().toISOString(),
        link: data?.link,
        read: data?.isRead ?? false,
      };

      setNotifications((prev) => {
        const next = [notif, ...prev];
        if (next.length > MAX_ITEMS) return next.slice(0, MAX_ITEMS);
        return next;
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, [authReady]);

  // ==================== SCROLL ====================
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;

    if (nearBottom && hasMore && !loadingMore && !loading) {
      loadPage(currentPage + 1);
    }
  }, [hasMore, loadingMore, loading, currentPage, loadPage]);

  // ==================== HANDLERS ====================
  const handleToggle = useCallback(async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);

    if (!authReady) return;

    // Reload list từ DB
    await reloadList();

    // Auto mark all read
    try {
      const unread = await getUnreadNotificationCount();
      if (unread > 0) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        await markAllNotificationsAsRead();
        console.log('✅ [Notify] Auto marked all as read');
      }
    } catch (err) {
      console.error('❌ [Notify] Lỗi markAll:', err);
    }
  }, [open, reloadList, authReady]);

  const handleDeleteItem = useCallback(async (item: NotificationItemType) => {
    if (typeof item.id !== 'number') return;

    const backup = [...notifications];
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    receivedIdsRef.current.delete(item.id);
    if (!item.read) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await deleteNotification(item.id);
    } catch (err) {
      console.error('❌ Lỗi xóa, rollback:', err);
      setNotifications(backup);
    }
  }, [notifications]);

  const handleClearAll = useCallback(async () => {
    if (!confirm('Xóa TẤT CẢ thông báo?')) return;
    if (notifications.length === 0) return;

    const backup = [...notifications];
    const unreadBackup = unreadCount;

    setNotifications([]);
    setUnreadCount(0);
    setHasMore(false);
    receivedIdsRef.current.clear();

    try {
      await deleteAllNotifications();
    } catch (err) {
      console.error('❌ Lỗi xóa tất cả, rollback:', err);
      setNotifications(backup);
      setUnreadCount(unreadBackup);
    }
  }, [notifications, unreadCount]);

  const handleItemClick = useCallback(
    async (item: NotificationItemType) => {
      if (!item.read) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        if (typeof item.id === 'number') {
          try {
            await markNotificationAsRead(item.id);
          } catch (err) {
            console.error('❌ Lỗi mark read:', err);
          }
        }
      }

      onItemClick?.(item);
      if (item.link) setOpen(false);
    },
    [onItemClick]
  );

  // ==================== RENDER ====================
  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 transition hover:bg-cyan-100"
        title="Thông báo"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-96 max-h-[520px] rounded-xl bg-white shadow-xl border border-slate-100 overflow-hidden z-50 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-900">
                Thông báo
                {notifications.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({notifications.length})
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto"
            >
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <FaSpinner className="animate-spin mr-2" size={12} />
                  <p className="text-xs">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FaBell className="text-3xl mb-2 opacity-40" />
                  <p className="text-xs">Không có thông báo nào</p>
                </div>
              ) : (
                <>
                  {notifications.map((n, idx) => (
                    <NotificationItem
                      key={n.id ?? idx}
                      item={n}
                      onClick={handleItemClick}
                      onDelete={handleDeleteItem}
                    />
                  ))}

                  {loadingMore && (
                    <div className="flex items-center justify-center py-3 text-slate-400">
                      <FaSpinner className="animate-spin mr-2" size={10} />
                      <span className="text-xs">Đang tải thêm...</span>
                    </div>
                  )}

                  {!hasMore && notifications.length >= PAGE_SIZE && (
                    <div className="text-center py-3 text-xs text-slate-400">
                      — Đã hiển thị tất cả {notifications.length} thông báo —
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}