// ============================================
// CourseController.java - Controller
// ============================================
package org.wisdom.oc01.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.CourseRequest;
import org.wisdom.oc01.dto.request.CourseSearchRequest;
import org.wisdom.oc01.dto.request.CourseStatusRequest;
import org.wisdom.oc01.dto.response.CourseResponse;
import org.wisdom.oc01.dto.response.HomePageCourseResponse;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.service.CourseService;

/**
 * ============================================================
 * COURSE CONTROLLER - QUẢN LÝ KHÓA HỌC
 * ============================================================
 *
 * 1. [TEACHER/ADMIN] Tạo khóa học mới
 * 2. [TEACHER/ADMIN] Cập nhật khóa học
 * 3. [TEACHER/ADMIN] Xóa khóa học
 * 4. [TEACHER/ADMIN] Cập nhật trạng thái
 * 5. [TEACHER/ADMIN] Nhân bản khóa học
 * 6. [TEACHER] Lấy danh sách khóa học của giảng viên
 * 7. [ALL] Lấy danh sách tất cả khóa học
 * 8. [ALL] Lấy chi tiết khóa học theo ID
 * 9. [ALL] Lấy chi tiết khóa học theo slug
 * 10. [ALL] Lấy dữ liệu trang chủ
 * 11. [TEACHER] Gửi khóa học cho Admin kiểm duyệt
 * ============================================================
 */
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // ==================== CREATE ====================

    // 1. TẠO KHÓA HỌC MỚI
    @PostMapping
    public ResponseEntity<RequestResponse> create(
            @Valid @ModelAttribute CourseRequest request) {

        Course course = courseService.createCourse(request, null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(course, "Tạo khóa học thành công"));
    }

    // 5. NHÂN BẢN (CLONE) KHÓA HỌC
    @PostMapping("/{id}/clone")
    public ResponseEntity<RequestResponse> cloneCourse(@PathVariable Integer id) {
        CourseResponse clonedCourse = courseService.cloneCourse(id, null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(clonedCourse, "Nhân bản khóa học thành công"));
    }

    // 11. GỬI KHÓA HỌC CHO ADMIN KIỂM DUYỆT
    @PostMapping("/{id}/submit-review")
    public ResponseEntity<RequestResponse> submitForReview(@PathVariable Integer id) {
        courseService.updateStatus(id, "PENDING_REVIEW");
        return ResponseEntity.ok(new RequestResponse("Đã gửi khóa học cho Admin kiểm duyệt"));
    }

    // ==================== UPDATE ====================

    // 2. CẬP NHẬT KHÓA HỌC
    @PutMapping("/{id}")
    public ResponseEntity<RequestResponse> update(
            @PathVariable Integer id,
            @Valid @ModelAttribute CourseRequest request) {

        Course course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(new RequestResponse(course, "Cập nhật khóa học thành công"));
    }

    // 4. CẬP NHẬT TRẠNG THÁI KHÓA HỌC
    @PatchMapping("/{id}/status")
    public ResponseEntity<RequestResponse> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody CourseStatusRequest request) {

        courseService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(new RequestResponse("Cập nhật trạng thái khóa học thành công"));
    }

    // ==================== DELETE ====================

    // 3. XÓA KHÓA HỌC
    @DeleteMapping("/{id}")
    public ResponseEntity<RequestResponse> delete(@PathVariable Integer id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(new RequestResponse("Xóa khóa học thành công"));
    }

    // ==================== GET ====================

    // 6. LẤY DANH SÁCH KHÓA HỌC CỦA GIẢNG VIÊN
    @GetMapping("/instructor")
    public ResponseEntity<RequestResponse> getInstructorCourses(
            @Valid CourseSearchRequest searchRequest) {

        Page<CourseResponse> courses = courseService.getCoursesByInstructor(null, searchRequest);
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học thành công"));
    }

    // 7. LẤY DANH SÁCH TẤT CẢ KHÓA HỌC (PUBLIC)
    @GetMapping
    public ResponseEntity<RequestResponse> getAll(@Valid CourseSearchRequest searchRequest) {
        Page<CourseResponse> courses = courseService.getAllCourses(searchRequest);
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học thành công"));
    }

    // 8. LẤY CHI TIẾT KHÓA HỌC THEO ID (PUBLIC)
    @GetMapping("/{id}")
    public ResponseEntity<RequestResponse> getById(@PathVariable Integer id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(new RequestResponse(course, "Lấy khóa học thành công"));
    }

    // 9. LẤY CHI TIẾT KHÓA HỌC THEO SLUG (PUBLIC)
    @GetMapping("/slug/{slug}")
    public ResponseEntity<RequestResponse> getBySlug(@PathVariable String slug) {
        CourseResponse course = courseService.getCourseBySlug(slug);
        return ResponseEntity.ok(new RequestResponse(course, "Lấy khóa học thành công"));
    }

    // 10. LẤY DỮ LIỆU KHÓA HỌC CHO TRANG CHỦ (PUBLIC)
    @GetMapping("/homepage")
    public ResponseEntity<RequestResponse> getHomePageCourses() {
        HomePageCourseResponse data = courseService.getHomePageCourses();
        return ResponseEntity.ok(new RequestResponse(data, "Lấy dữ liệu trang chủ thành công"));
    }
}