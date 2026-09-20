// ============================================
// ChapterController.java - Controller (Đúng chuẩn)
// ============================================
package org.wisdom.oc01.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.ChapterRequest;
import org.wisdom.oc01.dto.request.UpdateOrderRequest;
import org.wisdom.oc01.dto.response.ChapterResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.ChapterService;

import java.util.List;

/**
 * ============================================================
 * CHAPTER CONTROLLER - QUẢN LÝ CHƯƠNG
 * ============================================================
 *
 * 1. [PUBLIC] Lấy chương của khóa học
 * 2. [PUBLIC] Lấy chương theo ID
 * 3. [PUBLIC] Lấy chương kèm bài học
 * 4. [TEACHER/ADMIN] Tạo chương mới
 * 5. [TEACHER/ADMIN] Cập nhật chương
 * 6. [TEACHER/ADMIN] Xóa chương
 * 7. [TEACHER/ADMIN] Cập nhật thứ tự chương
 * 8. [TEACHER/ADMIN] Cập nhật thứ tự hàng loạt
 * ============================================================
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    // ============================================================
    // 1. LẤY CHƯƠNG CỦA KHÓA HỌC (PUBLIC)
    // ============================================================
    @GetMapping("/courses/{courseId}/chapters")
    public ResponseEntity<RequestResponse> getChaptersByCourse(@PathVariable Integer courseId) {
        List<ChapterResponse> chapters = chapterService.getChaptersByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(chapters, "Lấy danh sách chương thành công"));
    }

    // ============================================================
    // 2. LẤY CHƯƠNG THEO ID (PUBLIC)
    // ============================================================
    @GetMapping("/chapters/{id}")
    public ResponseEntity<RequestResponse> getChapterById(@PathVariable Integer id) {
        ChapterResponse chapter = chapterService.getChapterById(id);
        return ResponseEntity.ok(new RequestResponse(chapter, "Lấy chương thành công"));
    }

    // ============================================================
    // 3. LẤY CHƯƠNG KÈM BÀI HỌC (PUBLIC)
    // ============================================================
    @GetMapping("/chapters/{id}/lessons")
    public ResponseEntity<RequestResponse> getChapterWithLessons(@PathVariable Integer id) {
        ChapterResponse chapter = chapterService.getChapterWithLessons(id);
        return ResponseEntity.ok(new RequestResponse(chapter, "Lấy chương kèm bài học thành công"));
    }

    // ============================================================
    // 4. TẠO CHƯƠNG MỚI (TEACHER/ADMIN)
    // ============================================================
    @PostMapping("/courses/{courseId}/chapters")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> createChapter(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId,
            @Valid @RequestBody ChapterRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        ChapterResponse created = chapterService.createChapter(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(created, "Tạo chương thành công"));
    }

    // ============================================================
    // 5. CẬP NHẬT CHƯƠNG (TEACHER/ADMIN)
    // ============================================================
    @PutMapping("/chapters/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> updateChapter(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id,
            @Valid @RequestBody ChapterRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        ChapterResponse updated = chapterService.updateChapter(id, request);
        return ResponseEntity.ok(new RequestResponse(updated, "Cập nhật chương thành công"));
    }

    // ============================================================
    // 6. XÓA CHƯƠNG (TEACHER/ADMIN)
    // ============================================================
    @DeleteMapping("/chapters/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> deleteChapter(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        chapterService.deleteChapter(id);
        return ResponseEntity.ok(new RequestResponse("Xóa chương thành công"));
    }

    // ============================================================
    // 7. CẬP NHẬT THỨ TỰ CHƯƠNG (TEACHER/ADMIN)
    // ============================================================
    @PatchMapping("/chapters/{id}/order")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> updateOrderIndex(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id,
            @RequestParam Integer newOrderIndex) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        ChapterResponse chapter = chapterService.updateOrderIndex(id, newOrderIndex);
        return ResponseEntity.ok(new RequestResponse(chapter, "Cập nhật thứ tự chương thành công"));
    }

    // ============================================================
    // 8. CẬP NHẬT THỨ TỰ HÀNG LOẠT (TEACHER/ADMIN)
    // ============================================================
    @PutMapping("/chapters/batch/order")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> updateOrderBatch(
            @AuthenticationPrincipal Account account,
            @Valid @RequestBody List<UpdateOrderRequest> updates) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        chapterService.updateOrderBatch(updates);
        return ResponseEntity.ok(new RequestResponse("Cập nhật thứ tự chương thành công"));
    }
}