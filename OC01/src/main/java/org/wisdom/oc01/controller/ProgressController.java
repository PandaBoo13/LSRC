// ============================================================
// PROGRESS CONTROLLER - QUẢN LÝ TIẾN ĐỘ HỌC TẬP
// ============================================================
package org.wisdom.oc01.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.progress.ProgressTimeSpentRequest;
import org.wisdom.oc01.dto.request.progress.ProgressUpdateRequest;
import org.wisdom.oc01.dto.request.progress.ProgressScoreRequest;
import org.wisdom.oc01.dto.response.ProgressResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.ProgressService;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    // ==================== HELPER ====================

    /** Lấy account từ SecurityContext, throw nếu null. */
    private Account getAccountOrThrow(Account account) {
        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }
        return account;
    }

    // ==================== COURSE PROGRESS ====================

    /** Bắt đầu học khóa học. Tạo COURSE progress nếu chưa có. */
    @PostMapping("/course/{courseId}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> startCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.startCourse(currentAccount.getIdAccount(), courseId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(progress, "Bắt đầu học khóa học thành công"));
    }

    /** Lấy tiến độ khóa học của học viên hiện tại. */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getCourseProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.getCourseProgress(currentAccount.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse(progress, "Lấy tiến độ thành công"));
    }

    /** Lấy danh sách tiến độ tất cả khóa học của học viên. */
    @GetMapping("/my-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getMyProgress(
            @AuthenticationPrincipal Account account) {

        Account currentAccount = getAccountOrThrow(account);
        List<ProgressResponse> progressList = progressService.getProgressByAccount(currentAccount.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(progressList, "Lấy danh sách tiến độ thành công"));
    }

    /** Tính lại tiến độ khóa học. */
    @PostMapping("/course/{courseId}/recalculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> recalculateProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.recalculateCourseProgress(
                currentAccount.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse(progress, "Tính lại tiến độ thành công"));
    }


    /**
     * [INSTRUCTOR / ADMIN ONLY] Lấy RESOURCE progress của 1 học viên cụ thể.
     *
     * Quyền (check ở service):
     *  - Instructor sở hữu course → OK.
     *  - Admin → OK.
     *  - Khác → 403 Forbidden.
     *
     * GET /api/progress/instructor/course/{courseId}/student/{studentId}
     *
     * @param courseId   ID khóa học
     * @param studentId  accountId của học viên cần xem
     */
    @GetMapping("/instructor/course/{courseId}/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> getStudentResourceForInstructor(
            @PathVariable("courseId") Integer courseId,
            @PathVariable("studentId") Integer studentId) {
        List<ProgressResponse> result = progressService.getStudentResourceProgressForInstructor(studentId,courseId);
        return ResponseEntity.ok(new RequestResponse(result,"Lay danh sach tien do thanh cong"));
    }
    /** Cập nhật thời gian học khóa học. */
    @PutMapping("/course/{courseId}/time-spent")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> updateCourseTimeSpent(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId,
            @RequestBody ProgressTimeSpentRequest request) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.updateCourseTimeSpent(
                currentAccount.getIdAccount(), courseId, request.getTimeSpent());
        return ResponseEntity.ok(new RequestResponse(progress, "Cập nhật thời gian học thành công"));
    }

    /** Đánh dấu hoàn thành khóa học. */
    @PutMapping("/course/{courseId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> completeCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.completeCourse(currentAccount.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse(progress, "Hoàn thành khóa học thành công"));
    }

    /** Lấy tiến độ tất cả học viên trong khóa học (Instructor/Admin). */
    @GetMapping("/course/{courseId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> getProgressByCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        getAccountOrThrow(account);
        List<ProgressResponse> progressList = progressService.getProgressByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(progressList, "Lấy danh sách tiến độ thành công"));
    }

    /** Reset tiến độ khóa học. */
    @DeleteMapping("/course/{courseId}/reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> resetCourseProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        progressService.resetCourseProgress(currentAccount.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse(null, "Reset tiến độ khóa học thành công"));
    }

    // ==================== RESOURCE PROGRESS ====================

    /** Bắt đầu học resource. */
    @PostMapping("/resource/{resourceId}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> startResource(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId,
            @RequestParam Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.startResource(
                currentAccount.getIdAccount(), resourceId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(progress, "Bắt đầu học tài nguyên thành công"));
    }

    /** Lấy tiến độ resource. */
    @GetMapping("/resource/{resourceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getResourceProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.getResourceProgress(
                currentAccount.getIdAccount(), resourceId);
        return ResponseEntity.ok(new RequestResponse(progress, "Lấy tiến độ tài nguyên thành công"));
    }

    /** Lấy tiến độ tất cả resources trong khóa học. */
    @GetMapping("/course/{courseId}/resources")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getResourceProgressByCourse(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        Account currentAccount = getAccountOrThrow(account);
        List<ProgressResponse> progressList = progressService.getResourceProgressByCourse(
                currentAccount.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse(progressList, "Lấy danh sách tiến độ tài nguyên thành công"));
    }

    /** Cập nhật % tiến độ resource. */
    @PutMapping("/resource/{resourceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> updateResourceProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId,
            @RequestBody ProgressUpdateRequest request) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.updateResourceProgress(
                currentAccount.getIdAccount(), resourceId, request.getProgress());
        return ResponseEntity.ok(new RequestResponse(progress, "Cập nhật tiến độ tài nguyên thành công"));
    }

    /** Cập nhật thời gian học resource. */
    @PutMapping("/resource/{resourceId}/time-spent")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> updateResourceTimeSpent(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId,
            @RequestBody ProgressTimeSpentRequest request) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.updateResourceTimeSpent(
                currentAccount.getIdAccount(), resourceId, request.getTimeSpent());
        return ResponseEntity.ok(new RequestResponse(progress, "Cập nhật thời gian học thành công"));
    }

    /** Cập nhật điểm resource (quiz). */
    @PutMapping("/resource/{resourceId}/score")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> updateResourceScore(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId,
            @RequestBody ProgressScoreRequest request) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.updateResourceScore(
                currentAccount.getIdAccount(), resourceId,
                request.getScore(), request.getMaxScore(), request.getIsPassed());
        return ResponseEntity.ok(new RequestResponse(progress, "Cập nhật điểm thành công"));
    }

    /** Đánh dấu hoàn thành resource. */
    @PutMapping("/resource/{resourceId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> completeResource(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.completeResource(
                currentAccount.getIdAccount(), resourceId);
        return ResponseEntity.ok(new RequestResponse(progress, "Hoàn thành tài nguyên thành công"));
    }

    /** Tăng số lần thử quiz. */
    @PutMapping("/resource/{resourceId}/attempt")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> incrementResourceAttempt(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId) {

        Account currentAccount = getAccountOrThrow(account);
        ProgressResponse progress = progressService.incrementResourceAttempt(
                currentAccount.getIdAccount(), resourceId);
        return ResponseEntity.ok(new RequestResponse(progress, "Tăng số lần thử thành công"));
    }

    /** Reset tiến độ resource. */
    @DeleteMapping("/resource/{resourceId}/reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> resetResourceProgress(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer resourceId) {

        Account currentAccount = getAccountOrThrow(account);
        progressService.resetResourceProgress(currentAccount.getIdAccount(), resourceId);
        return ResponseEntity.ok(new RequestResponse(null, "Reset tiến độ tài nguyên thành công"));
    }
}