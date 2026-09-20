// ============================================
// OrderItemController.java - Quản lý đăng ký khóa học
// ============================================
package org.wisdom.oc01.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.progress.ProgressUpdateRequest;
import org.wisdom.oc01.dto.response.OrderItemResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.OrderItemService;

import java.util.List;

/**
 * ============================================================
 * ORDER ITEM CONTROLLER - QUẢN LÝ ĐĂNG KÝ KHÓA HỌC
 * ============================================================
 *
 * 1. [STUDENT] Lấy danh sách khóa học đã đăng ký
 * 2. [STUDENT] Lấy danh sách khóa học đang chờ khai giảng
 * 3. [STUDENT] Lấy danh sách khóa học đang học
 * 4. [STUDENT] Lấy danh sách khóa học đã hoàn thành
 * 5. [STUDENT] Cập nhật tiến độ học
 * 6. [STUDENT] Đánh dấu hoàn thành khóa học
 * 7. [STUDENT] Bỏ khóa học
 * 8. [TEACHER/ADMIN] Lấy danh sách học viên của khóa học
 * 9. [TEACHER/ADMIN] Đếm số học viên của khóa học
 * ============================================================
 */
@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {

    private final OrderItemService orderItemService;

    // ============================================================
    // 1. LẤY DANH SÁCH KHÓA HỌC ĐÃ ĐĂNG KÝ
    // ============================================================
    @GetMapping("/enrolled")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getEnrolledCourses(
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        List<OrderItemResponse> courses = orderItemService.getEnrolledCourses(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học đã đăng ký thành công"));
    }

    // ============================================================
    // 2. LẤY DANH SÁCH KHÓA HỌC ĐANG CHỜ KHAI GIẢNG
    // ============================================================
    @GetMapping("/waiting")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getWaitingCourses(
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        List<OrderItemResponse> courses = orderItemService.getWaitingCourses(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học đang chờ thành công"));
    }

    // ============================================================
    // 3. LẤY DANH SÁCH KHÓA HỌC ĐANG HỌC
    // ============================================================
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getActiveCourses(
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        List<OrderItemResponse> courses = orderItemService.getActiveCourses(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học đang học thành công"));
    }

    // ============================================================
    // 4. LẤY DANH SÁCH KHÓA HỌC ĐÃ HOÀN THÀNH
    // ============================================================
    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getCompletedCourses(
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        List<OrderItemResponse> courses = orderItemService.getCompletedCourses(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học đã hoàn thành thành công"));
    }

    // ============================================================
    // 5. CẬP NHẬT TIẾN ĐỘ HỌC
    // ============================================================
    @PutMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> updateProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id,
            @RequestBody ProgressUpdateRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        OrderItemResponse orderItem = orderItemService.updateProgress(id, request.getProgress());
        return ResponseEntity.ok(new RequestResponse(orderItem, "Cập nhật tiến độ thành công"));
    }

    // ============================================================
    // 6. ĐÁNH DẤU HOÀN THÀNH KHÓA HỌC
    // ============================================================
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> completeCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        OrderItemResponse orderItem = orderItemService.completeCourse(id);
        return ResponseEntity.ok(new RequestResponse(orderItem, "Hoàn thành khóa học thành công"));
    }

    // ============================================================
    // 7. BỎ KHÓA HỌC
    // ============================================================
    @PutMapping("/{id}/drop")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> dropCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        OrderItemResponse orderItem = orderItemService.dropCourse(id);
        return ResponseEntity.ok(new RequestResponse(orderItem, "Bỏ khóa học thành công"));
    }

    // ============================================================
    // 8. LẤY DANH SÁCH HỌC VIÊN CỦA KHÓA HỌC (TEACHER/ADMIN)
    // ============================================================
    @GetMapping("/course/{courseId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> getStudentsByCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        List<OrderItemResponse> students = orderItemService.getStudentsByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(students, "Lấy danh sách học viên thành công"));
    }

    // ============================================================
    // 9. ĐẾM SỐ HỌC VIÊN CỦA KHÓA HỌC (TEACHER/ADMIN)
    // ============================================================
    @GetMapping("/course/{courseId}/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> countStudentsByCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        Long count = orderItemService.countStudentsByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(count, "Đếm số học viên thành công"));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> deleteOrderItem(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        orderItemService.deleteOrderItem(id);
        return ResponseEntity.ok(new RequestResponse("Xóa khóa học khỏi giỏ hàng thành công"));
    }
}