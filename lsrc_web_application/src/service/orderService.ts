// src/service/orderService.ts
import api from '../api/axiosConfig';
import type {
  OrderResponse,
  OrderItemResponse,
  PaymentRequest,
  PaymentResponse,
  CreateOrderRequest,
  CreateOrderResult,
  OrderQueryParams,
  UpdateProgressRequest,
  OrderStatistics,
  CourseEnrollmentStats,
  OrderCategory,
  PaymentMethod,
} from '../types/order.types';
import type { PageResponse, RequestResponse } from '../types/course.types';

// ==================== HELPER ====================

/** Payment method đánh dấu đơn miễn phí (khớp với backend constant) */
const PAYMENT_METHOD_FREE: PaymentMethod = 'FREE';

/**
 * ✅ Phân loại đơn hàng dựa trên status + paymentMethod.
 * Dùng để FE quyết định UI (ẩn nút thanh toán, hiện badge "Miễn phí"...).
 */
export const getOrderCategory = (order: OrderResponse): OrderCategory => {
  if (order.status === 'CANCELLED') return 'CANCELLED';
  if (order.status === 'FAILED') return 'FAILED';
  if (order.status === 'PAID') {
    return order.paymentMethod === PAYMENT_METHOD_FREE ? 'FREE' : 'PAID';
  }
  return 'PENDING';
};

/** ✅ Kiểm tra đơn có phải miễn phí không (đã PAID + paymentMethod = FREE) */
export const isFreeOrder = (order: OrderResponse): boolean =>
  order.status === 'PAID' && order.paymentMethod === PAYMENT_METHOD_FREE;

/** ✅ Kiểm tra đơn cần thanh toán (PENDING) */
export const requiresPayment = (order: OrderResponse): boolean =>
  order.status === 'PENDING';

// ==================== ORDER APIs ====================

/**
 * ✅ Tạo đơn hàng mới — trả về thêm metadata để FE biết có cần thanh toán không.
 * POST /api/orders
 *
 * Backend xử lý:
 * - Nếu tất cả course đều miễn phí → order trả về status = PAID, paymentMethod = 'FREE',
 *   items đã ENROLLED ngay → FE chỉ cần hiện "Đăng ký thành công".
 * - Nếu có phí → order status = PENDING, paymentMethod = null → FE cần redirect thanh toán.
 */
export const createOrder = async (courseIds: number[]): Promise<CreateOrderResult> => {
  const response = await api.post<RequestResponse<OrderResponse>>(
    '/orders',
    { courseIds } as CreateOrderRequest
  );
  const order = response.data.data;
  return {
    order,
    isFreeOrder: isFreeOrder(order),
    requiresPayment: requiresPayment(order),
  };
};

/**
 * Lấy danh sách đơn hàng của tôi
 * GET /api/orders/my-orders
 */
export const getMyOrders = async (
  params?: OrderQueryParams
): Promise<PageResponse<OrderResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<OrderResponse>>>(
    '/orders/my-orders',
    { params }
  );
  return response.data.data;
};

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/{id}
 */
export const getOrderById = async (id: number): Promise<OrderResponse> => {
  const response = await api.get<RequestResponse<OrderResponse>>(`/orders/${id}`);
  return response.data.data;
};

/**
 * Thanh toán đơn hàng.
 * POST /api/orders/payment
 *
 * ⚠️ KHÔNG gọi hàm này cho đơn miễn phí (paymentMethod = 'FREE').
 * Backend đã early-return nếu là đơn free, nhưng FE nên chủ động bỏ qua
 * để tránh UX kỳ cục (gọi API thừa).
 *
 * @returns OrderResponse cho payment thường, PaymentResponse cho VNPAY
 */
export const processPayment = async (
  data: PaymentRequest
): Promise<OrderResponse | PaymentResponse> => {
  const response = await api.post<RequestResponse<OrderResponse | PaymentResponse>>(
    '/orders/payment',
    data
  );
  return response.data.data;
};

/**
 * Hủy đơn hàng
 * PUT /api/orders/{id}/cancel
 *
 * ⚠️ Không thể hủy đơn miễn phí vì backend yêu cầu status = PENDING.
 */
export const cancelOrder = async (id: number): Promise<void> => {
  await api.put(`/orders/${id}/cancel`);
};

/**
 * [ADMIN] Lấy tất cả đơn hàng
 * GET /api/orders/admin
 */
export const getAllOrders = async (
  params?: OrderQueryParams
): Promise<PageResponse<OrderResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<OrderResponse>>>(
    '/orders/admin',
    { params }
  );
  return response.data.data;
};

/**
 * [ADMIN] Lấy đơn hàng theo trạng thái
 * GET /api/orders/admin/status/{status}
 */
export const getOrdersByStatus = async (
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED',
  params?: { page?: number; size?: number }
): Promise<PageResponse<OrderResponse>> => {
  const response = await api.get<RequestResponse<PageResponse<OrderResponse>>>(
    `/orders/admin/status/${status}`,
    { params }
  );
  return response.data.data;
};

/**
 * [ADMIN] Lấy thống kê đơn hàng
 * GET /api/orders/admin/statistics
 * (Nếu backend có API này)
 */
export const getOrderStatistics = async (): Promise<OrderStatistics> => {
  const response = await api.get<RequestResponse<OrderStatistics>>(
    '/orders/admin/statistics'
  );
  return response.data.data;
};

// ==================== ORDER ITEM APIs ====================

/**
 * Lấy danh sách khóa học đã đăng ký (bao gồm cả khóa miễn phí vì đã ENROLLED).
 * GET /api/order-items/enrolled
 */
export const getEnrolledCourses = async (): Promise<OrderItemResponse[]> => {
  const response = await api.get<RequestResponse<OrderItemResponse[]>>('/order-items/enrolled');
  return response.data.data;
};

/**
 * Lấy danh sách khóa học đang chờ khai giảng
 * GET /api/order-items/waiting
 */
export const getWaitingCourses = async (): Promise<OrderItemResponse[]> => {
  const response = await api.get<RequestResponse<OrderItemResponse[]>>('/order-items/waiting');
  return response.data.data;
};

/**
 * Lấy danh sách khóa học đang học
 * GET /api/order-items/active
 */
export const getActiveCourses = async (): Promise<OrderItemResponse[]> => {
  const response = await api.get<RequestResponse<OrderItemResponse[]>>('/order-items/active');
  return response.data.data;
};

/**
 * Lấy danh sách khóa học đã hoàn thành
 * GET /api/order-items/completed
 */
export const getCompletedCourses = async (): Promise<OrderItemResponse[]> => {
  const response = await api.get<RequestResponse<OrderItemResponse[]>>('/order-items/completed');
  return response.data.data;
};

/**
 * Cập nhật tiến độ học
 * PUT /api/order-items/{id}/progress
 */
export const updateCourseProgress = async (
  id: number,
  progress: number
): Promise<OrderItemResponse> => {
  const response = await api.put<RequestResponse<OrderItemResponse>>(
    `/order-items/${id}/progress`,
    { progress } as UpdateProgressRequest
  );
  return response.data.data;
};

/**
 * Đánh dấu hoàn thành khóa học
 * PUT /api/order-items/{id}/complete
 */
export const completeCourse = async (id: number): Promise<OrderItemResponse> => {
  const response = await api.put<RequestResponse<OrderItemResponse>>(
    `/order-items/${id}/complete`
  );
  return response.data.data;
};

/**
 * Bỏ khóa học
 * PUT /api/order-items/{id}/drop
 */
export const dropCourse = async (id: number): Promise<OrderItemResponse> => {
  const response = await api.put<RequestResponse<OrderItemResponse>>(
    `/order-items/${id}/drop`
  );
  return response.data.data;
};

/**
 * [TEACHER/ADMIN] Lấy danh sách học viên của khóa học
 * GET /api/order-items/course/{courseId}/students
 */
export const getStudentsByCourse = async (courseId: number): Promise<OrderItemResponse[]> => {
  const response = await api.get<RequestResponse<OrderItemResponse[]>>(
    `/order-items/course/${courseId}/students`
  );
  return response.data.data;
};

/**
 * [TEACHER/ADMIN] Đếm số học viên của khóa học
 * GET /api/order-items/course/{courseId}/count
 */
export const countStudentsByCourse = async (courseId: number): Promise<number> => {
  const response = await api.get<RequestResponse<number>>(
    `/order-items/course/${courseId}/count`
  );
  return response.data.data;
};

/**
 * [TEACHER/ADMIN] Lấy thống kê đăng ký của khóa học
 * GET /api/order-items/course/{courseId}/statistics
 * (Nếu backend có API này)
 */
export const getCourseEnrollmentStats = async (
  courseId: number
): Promise<CourseEnrollmentStats> => {
  const response = await api.get<RequestResponse<CourseEnrollmentStats>>(
    `/order-items/course/${courseId}/statistics`
  );
  return response.data.data;
};

// ==================== VNPAY ====================

/**
 * Kiểm tra trạng thái thanh toán VNPAY
 * GET /api/orders/vnpay/check/{orderId}
 * (Nếu backend có API này)
 */
export const checkVnPayStatus = async (orderId: number): Promise<PaymentResponse> => {
  const response = await api.get<RequestResponse<PaymentResponse>>(
    `/orders/vnpay/check/${orderId}`
  );
  return response.data.data;
};

/**
 * Xóa OrderItem khỏi giỏ hàng
 * DELETE /api/order-items/{id}
 */
export const deleteOrderItem = async (id: number): Promise<void> => {
  await api.delete(`/order-items/${id}`);
};