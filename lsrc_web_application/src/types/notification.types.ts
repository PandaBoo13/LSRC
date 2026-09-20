// src/types/notification.types.ts

// ==================== ENUMS ====================

export type NotificationType =
  | 'CHAT_NEW_MESSAGE'
  | 'ORDER_SUCCESS'
  | 'ORDER_CANCELLED'
  | 'COURSE_PUBLISHED'
  | 'COURSE_EXPIRING'
  | 'ASSIGNMENT_GRADED'
  | 'STUDENT_ENROLLED'
  | 'PROMOTION'
  | 'SYSTEM_MAINTENANCE'
  | 'SYSTEM_ALERT';

export type NotificationScope =
  | 'SINGLE_USER'
  | 'MULTIPLE_USERS'
  | 'ALL_STUDENTS'
  | 'ALL_TEACHERS'
  | 'ALL_USERS'
  | 'COURSE_STUDENTS'
  | 'COURSE_TEACHER';

// ==================== RESPONSE ====================

export interface NotificationResponse {
  id: number;
  senderId: number | null;
  senderName: string;
  notificationType: string;
  title: string;
  content: string;
  referenceType?: string;
  referenceId?: number;
  extraData?: string;
  isRead: boolean;
  readAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface NotificationPageResponse {
  notifications: NotificationResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  unreadCount: number;
}

// ==================== REQUEST ====================

export interface NotificationRequest {
  notificationType: NotificationType;
  senderAccountId?: number;
  receiverAccountId?: number;
  receiverAccountIds?: number[];
  receiverRole?: string;
  courseId?: number;
  title: string;
  content: string;
  referenceType?: string;
  referenceId?: number;
  extraData?: Record<string, any>;
}