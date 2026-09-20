// ============================================
// OrderItemService.java - Service Interface
// ============================================
package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.response.OrderItemResponse;

import java.math.BigDecimal;
import java.util.List;

public interface OrderItemService {

    // Lấy danh sách khóa học đã đăng ký của account
    List<OrderItemResponse> getEnrolledCourses(Integer accountId);

    // Lấy danh sách khóa học đang chờ của account
    List<OrderItemResponse> getWaitingCourses(Integer accountId);

    // Lấy danh sách khóa học đang học của account
    List<OrderItemResponse> getActiveCourses(Integer accountId);

    // Lấy danh sách khóa học đã hoàn thành của account
    List<OrderItemResponse> getCompletedCourses(Integer accountId);

    // Lấy chi tiết order item
    OrderItemResponse getOrderItemById(Integer orderItemId);

    // Cập nhật tiến độ học
    OrderItemResponse updateProgress(Integer orderItemId, BigDecimal progress);

    // Đánh dấu hoàn thành khóa học
    OrderItemResponse completeCourse(Integer orderItemId);

    // Bỏ khóa học
    OrderItemResponse dropCourse(Integer orderItemId);

    // Lấy danh sách học viên của khóa học
    List<OrderItemResponse> getStudentsByCourse(Integer courseId);

    // Đếm số học viên của khóa học
    Long countStudentsByCourse(Integer courseId);
    void deleteOrderItem(Integer orderItemId);
}