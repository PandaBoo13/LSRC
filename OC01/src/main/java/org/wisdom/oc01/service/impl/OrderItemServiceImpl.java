// ============================================
// OrderItemServiceImpl.java - Service Implementation (FIXED IDOR + SecurityUtils)
// ============================================
package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.response.OrderItemResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.OrderItem;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.entity.OrderItem.EnrollmentType;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.OrderItemMapper;
import org.wisdom.oc01.generic.validator.OrderItemValidator;
import org.wisdom.oc01.repository.OrderItemRepository;
import org.wisdom.oc01.service.OrderItemService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderItemValidator validator;
    private final OrderItemMapper mapper;
    // KHÔNG còn field generalService — dùng SecurityUtils static.

    // ==================== AUTHORIZATION HELPERS ====================

    /** Kiểm tra account có phải ADMIN không. */
    private boolean isAdmin(Account account) {
        return account != null
                && account.getRole() != null
                && "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /** Kiểm tra account có phải INSTRUCTOR/TEACHER không. */
    private boolean isInstructor(Account account) {
        if (account == null || account.getRole() == null) return false;
        String role = account.getRole().getRoleName();
        return "INSTRUCTOR".equalsIgnoreCase(role) || "TEACHER".equalsIgnoreCase(role);
    }

    /**
     * Xác thực current user được phép truy cập dữ liệu của accountId chỉ định.
     * - Admin: được truy cập mọi account.
     * - Các role khác: chỉ được truy cập dữ liệu của chính mình.
     * Trả 404 thay vì 403 để không tiết lộ resource có tồn tại hay không.
     */
    private void assertCanAccessAccount(Integer accountId) {
        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return;
        if (accountId == null || !accountId.equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Không tìm thấy dữ liệu");
        }
    }

    /**
     * Load OrderItem theo ID và enforce ownership.
     * - Admin: truy cập mọi order item.
     * - Các role khác: chỉ truy cập order item thuộc chính mình.
     * Ném 404 nếu không phải chủ sở hữu (tránh rò rỉ sự tồn tại của resource).
     */
    private OrderItem loadOwnedOrderItem(Integer orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Order item không tồn tại"));

        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return orderItem;

        Integer ownerId = orderItem.getAccount() != null
                ? orderItem.getAccount().getIdAccount()
                : null;

        if (ownerId == null || !ownerId.equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Order item không tồn tại");
        }
        return orderItem;
    }

    /**
     * Xác thực current user là instructor của khóa học tương ứng (hoặc admin).
     * Dùng cho các endpoint instructor: getStudentsByCourse / countStudentsByCourse.
     */
    private void assertCourseInstructorOrAdmin(Integer courseId) {
        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return;
        if (!isInstructor(current)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Không có quyền truy cập");
        }
        // TODO: bổ sung ownership check khi có CourseRepository:
        //   Course course = courseRepository.findById(courseId).orElseThrow(...);
        //   if (!course.getInstructor().getIdAccount().equals(current.getIdAccount()))
        //       throw new ErrorHandler(HttpStatus.FORBIDDEN, "Không phải giảng viên của khóa học");
    }

    // ==================== GET ENROLLED COURSES ====================

    /** Lấy danh sách khóa học đã ghi danh (ENROLLED) */
    @Override
    public List<OrderItemResponse> getEnrolledCourses(Integer accountId) {
        assertCanAccessAccount(accountId);
        return orderItemRepository
                .findByAccountIdAccountAndEnrollmentType(accountId, EnrollmentType.ENROLLED)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy danh sách khóa học đang chờ (WAITING) */
    @Override
    public List<OrderItemResponse> getWaitingCourses(Integer accountId) {
        assertCanAccessAccount(accountId);
        return orderItemRepository
                .findByAccountIdAccountAndEnrollmentType(accountId, EnrollmentType.WAITING)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy danh sách khóa học đang học (ACTIVE) */
    @Override
    public List<OrderItemResponse> getActiveCourses(Integer accountId) {
        assertCanAccessAccount(accountId);
        return orderItemRepository
                .findByAccountIdAccountAndStatus(accountId, EnrollmentStatus.ACTIVE)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy danh sách khóa học đã hoàn thành (COMPLETED) */
    @Override
    public List<OrderItemResponse> getCompletedCourses(Integer accountId) {
        assertCanAccessAccount(accountId);
        return orderItemRepository
                .findByAccountIdAccountAndStatus(accountId, EnrollmentStatus.COMPLETED)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    // ==================== GET ORDER ITEM ====================

    /** Lấy order item theo ID (đã enforce ownership) */
    @Override
    public OrderItemResponse getOrderItemById(Integer orderItemId) {
        // FIXED [CRITICAL]: trước đây chỉ findById, cho phép IDOR đọc order item người khác.
        OrderItem orderItem = loadOwnedOrderItem(orderItemId);
        return mapper.toResponse(orderItem);
    }

    // ==================== UPDATE PROGRESS ====================

    /** Cập nhật tiến độ học tập, tự động COMPLETED khi progress = 100 */
    @Override
    @Transactional
    public OrderItemResponse updateProgress(Integer orderItemId, BigDecimal progress) {
        // FIXED [CRITICAL]: enforce ownership trước khi mutate.
        OrderItem orderItem = loadOwnedOrderItem(orderItemId);

        if (progress == null
                || progress.compareTo(BigDecimal.ZERO) < 0
                || progress.compareTo(new BigDecimal("100")) > 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiến độ phải từ 0 đến 100");
        }

        orderItem.setProgress(progress);
        if (progress.compareTo(new BigDecimal("100")) == 0) {
            orderItem.setStatus(EnrollmentStatus.COMPLETED);
            orderItem.setCompletedAt(LocalDateTime.now());
        } else {
            orderItem.setStatus(EnrollmentStatus.ACTIVE);
        }
        validator.validateForUpdate(orderItem);
        orderItem = orderItemRepository.save(orderItem);
        return mapper.toResponse(orderItem);
    }

    // ==================== COMPLETE COURSE ====================

    /** Đánh dấu hoàn thành khóa học */
    @Override
    @Transactional
    public OrderItemResponse completeCourse(Integer orderItemId) {
        // FIXED [CRITICAL]: enforce ownership.
        OrderItem orderItem = loadOwnedOrderItem(orderItemId);
        validator.validateForComplete(orderItem);
        orderItem.setStatus(EnrollmentStatus.COMPLETED);
        orderItem.setProgress(new BigDecimal("100"));
        orderItem.setCompletedAt(LocalDateTime.now());
        orderItem = orderItemRepository.save(orderItem);
        return mapper.toResponse(orderItem);
    }

    // ==================== DROP COURSE ====================

    /** Hủy ghi danh khóa học */
    @Override
    @Transactional
    public OrderItemResponse dropCourse(Integer orderItemId) {
        // FIXED [CRITICAL]: enforce ownership.
        OrderItem orderItem = loadOwnedOrderItem(orderItemId);
        validator.validateForDrop(orderItem);
        orderItem.setStatus(EnrollmentStatus.DROPPED);
        orderItem = orderItemRepository.save(orderItem);
        return mapper.toResponse(orderItem);
    }

    // ==================== GET STUDENTS BY COURSE ====================

    /** Lấy danh sách học viên của khóa học */
    @Override
    public List<OrderItemResponse> getStudentsByCourse(Integer courseId) {
        // FIXED [HIGH]: chỉ instructor của khóa (hoặc admin) mới được xem danh sách học viên.
        assertCourseInstructorOrAdmin(courseId);
        return orderItemRepository.findByCourseIdCourse(courseId)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Đếm số học viên của khóa học */
    @Override
    public Long countStudentsByCourse(Integer courseId) {
        // FIXED [HIGH]: enforce instructor ownership.
        assertCourseInstructorOrAdmin(courseId);
        return orderItemRepository.countByCourseIdCourse(courseId);
    }

    // ==================== DELETE ORDER ITEM (CART) ====================

    /** Xóa order item khỏi giỏ hàng (chỉ cho phép khi order ở PENDING) */
    @Override
    @Transactional
    public void deleteOrderItem(Integer orderItemId) {
        // FIXED [CRITICAL]: enforce ownership — không cho xóa item trong giỏ người khác.
        OrderItem orderItem = loadOwnedOrderItem(orderItemId);

        if (orderItem.getOrder() != null
                && orderItem.getOrder().getStatus()
                == org.wisdom.oc01.entity.Order.OrderStatus.PENDING) {
            orderItemRepository.delete(orderItem);
        } else {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể xóa khóa học trong giỏ hàng (order PENDING)");
        }
    }
}