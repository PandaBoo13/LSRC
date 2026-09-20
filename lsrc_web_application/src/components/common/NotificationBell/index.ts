// src/components/common/NotificationBell/index.ts

// Export component chính
export { NotificationBell } from './NotificationBell';

// Export component item (nếu cần dùng riêng ở chỗ khác)
export { NotificationItem } from './NotificationItem';

// Export types (dùng `export type` để tránh lỗi khi build)
export type {
  NotificationItem as NotificationItemType,
  NotificationBellProps,
} from './types';