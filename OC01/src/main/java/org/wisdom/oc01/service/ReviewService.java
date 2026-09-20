// ============================================
// ReviewService.java - Service Interface
// ============================================
package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.response.ReviewResponse;

public interface ReviewService {

    // Tạo đánh giá mới
    ReviewResponse createReview(Integer accountId, Integer courseId, Integer rating, String comment);

    // Cập nhật đánh giá
    ReviewResponse updateReview(Integer reviewId, Integer rating, String comment);

    // Xóa đánh giá
    void deleteReview(Integer reviewId);

    // Lấy đánh giá của account trong một khóa học
    ReviewResponse getReviewByAccountAndCourse(Integer accountId, Integer courseId);

    // Lấy tất cả đánh giá của khóa học
    Page<ReviewResponse> getReviewsByCourse(Integer courseId, Pageable pageable);

    // Lấy tất cả đánh giá của account
    Page<ReviewResponse> getReviewsByAccount(Integer accountId, Pageable pageable);

    // Lấy rating trung bình của khóa học
    Double getAverageRating(Integer courseId);

    // Đếm số đánh giá của khóa học
    Long countReviewsByCourse(Integer courseId);
}