// src/types/order.types.ts

// ==================== ORDER ITEM ====================

export interface OrderItemResponse {
  id: number;
  accountId: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl?: string;
  price: number;
  discount: number;
  finalPrice: number;
  enrollmentType: 'ENROLLED' | 'WAITING';
  progress: number;
  courseBackgroundType?: 'GRADIENT' | 'PATTERN' | 'IMAGE' | 'SOLID';
  courseBackgroundThumbnail?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'ARCHIVED';
  completedAt?: string | null;
}

// ==================== ORDER ====================

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type PaymentMethod =
  | 'FREE'
  | 'VNPAY'
  | 'MOMO'
  | 'ZALOPAY'
  | 'PAYPAL'
  | 'STRIPE'
  | 'COD'
  | string;

export interface OrderResponse {
  id: number;
  accountId: number;
  username: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;

  // Thanh toán
  paymentMethod: PaymentMethod | null;
  transactionId: string | null;
  gatewayResponse?: string | null;
  paymentUrl?: string | null;
  paidAt?: string | null;
  paymentLog?: string | null;
  paidCurrency?: string | null;
  paidAmount?: number | null;

  // Hóa đơn
  invoiceNumber?: string | null;
  buyerName?: string | null;
  buyerEmail?: string | null;
  invoiceIssuedAt?: string | null;

  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

// ==================== HELPER TYPES ====================

export type OrderCategory = 'FREE' | 'PAID' | 'PENDING' | 'CANCELLED' | 'FAILED';

export interface CreateOrderResult {
  order: OrderResponse;
  isFreeOrder: boolean;
  requiresPayment: boolean;
}

// ==================== PAYMENT ====================

/**
 * Request thanh toán.
 *
 * FIXED [CRITICAL]:
 *  - BE không tin `amount` / `paidAmount` / `currency` từ client nữa.
 *  - BE tự tính từ `order.finalAmount × rate` (SGD → VND).
 *  - Chỉ giữ `orderId` + `paymentMethod`.
 *  - `transactionId` optional (BE hiện ignore với VNPAY).
 *
 * Gửi thừa các field cũ → BE ignore, nhưng nên dọn type cho sạch.
 */
export interface PaymentRequest {
  orderId: number;
  paymentMethod: string;
  transactionId?: string;
}

// Response khi thanh toán VNPAY
export interface PaymentResponse {
  orderId?: number;
  paymentUrl?: string;
  paymentMethod?: string;
  status?: string;
  [key: string]: any;
}

// ==================== CREATE ORDER ====================

/**
 * Request tạo order.
 *
 * FIXED [CRITICAL]: BE không tin `accountId` từ client nữa.
 * Chỉ gửi courseIds — BE tự lấy current user từ SecurityContext.
 */
export interface CreateOrderRequest {
  courseIds: number[];
}

// ==================== REQUEST PARAMS ====================

export interface OrderQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// ==================== UPDATE PROGRESS ====================

export interface UpdateProgressRequest {
  progress: number;
}

// ==================== STATISTICS ====================

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export interface CourseEnrollmentStats {
  courseId: number;
  totalStudents: number;
  completedStudents: number;
  activeStudents: number;
  droppedStudents: number;
  averageProgress: number;
}