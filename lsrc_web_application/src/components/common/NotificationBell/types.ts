// src/components/common/NotificationBell/types.ts

export type NotificationItem = {
  id?: number | string;
  title: string;
  content?: string;
  message?: string;
  createdAt?: string;
  read?: boolean;
  link?: string;
};

export type NotificationBellProps = {
  /** Số lượng thông báo tối đa lưu trong danh sách */
  maxItems?: number;
  /** Callback khi click vào 1 thông báo */
  onItemClick?: (item: NotificationItem) => void;
};