// ============================================
// ReviewController.java - Controller
// ============================================
package org.wisdom.oc01.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.ReviewRequest;
import org.wisdom.oc01.dto.response.ReviewResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.ReviewService;

/**
 * ============================================================
 * REVIEW CONTROLLER - QUẢN LÝ ĐÁNH GIÁ KHÓA HỌC
 * ============================================================
 *
 * 1. [STUDENT] Tạo đánh giá mới
 * 2. [STUDENT] Cập nhật đánh giá
 * 3. [STUDENT] Xóa đánh giá
 * 4. [PUBLIC] Lấy đánh giá của khóa học
 * 5. [STUDENT] Lấy đánh giá của tôi
 * 6. [PUBLIC] Lấy rating trung bình của khóa học
 * 7. [PUBLIC] Đếm số đánh giá của khóa học
 * ============================================================
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ============================================================
    // 1. TẠO ĐÁNH GIÁ MỚI
    // ============================================================
    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> createReview(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId,
            @Valid @RequestBody ReviewRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        ReviewResponse review = reviewService.createReview(
                account.getIdAccount(), courseId, request.getRating(), request.getComment());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(review, "Tạo đánh giá thành công"));
    }

    // ============================================================
    // 2. CẬP NHẬT ĐÁNH GIÁ
    // ============================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> updateReview(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id,
            @Valid @RequestBody ReviewRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        ReviewResponse review = reviewService.updateReview(id, request.getRating(), request.getComment());
        return ResponseEntity.ok(new RequestResponse(review, "Cập nhật đánh giá thành công"));
    }

    // ============================================================
    // 3. XÓA ĐÁNH GIÁ
    // ============================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> deleteReview(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        reviewService.deleteReview(id);
        return ResponseEntity.ok(new RequestResponse("Xóa đánh giá thành công"));
    }

    // ============================================================
    // 4. LẤY ĐÁNH GIÁ CỦA KHÓA HỌC (PUBLIC)
    // ============================================================
    @GetMapping("/course/{courseId}")
    public ResponseEntity<RequestResponse> getReviewsByCourse(
            @PathVariable Integer courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> reviews = reviewService.getReviewsByCourse(courseId, pageable);
        return ResponseEntity.ok(new RequestResponse(reviews, "Lấy danh sách đánh giá thành công"));
    }

    // ============================================================
    // 5. LẤY ĐÁNH GIÁ CỦA TÔI
    // ============================================================
    @GetMapping("/my-reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getMyReviews(
            @AuthenticationPrincipal Account account,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewResponse> reviews = reviewService.getReviewsByAccount(account.getIdAccount(), pageable);
        return ResponseEntity.ok(new RequestResponse(reviews, "Lấy danh sách đánh giá thành công"));
    }

    // ============================================================
    // 6. LẤY RATING TRUNG BÌNH CỦA KHÓA HỌC (PUBLIC)
    // ============================================================
    @GetMapping("/course/{courseId}/average")
    public ResponseEntity<RequestResponse> getAverageRating(@PathVariable Integer courseId) {
        Double average = reviewService.getAverageRating(courseId);
        return ResponseEntity.ok(new RequestResponse(average, "Lấy rating trung bình thành công"));
    }

    // ============================================================
    // 7. ĐẾM SỐ ĐÁNH GIÁ CỦA KHÓA HỌC (PUBLIC)
    // ============================================================
    @GetMapping("/course/{courseId}/count")
    public ResponseEntity<RequestResponse> countReviews(@PathVariable Integer courseId) {
        Long count = reviewService.countReviewsByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(count, "Đếm số đánh giá thành công"));
    }
}