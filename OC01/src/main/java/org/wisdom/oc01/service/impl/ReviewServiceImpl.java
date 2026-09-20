// ============================================
// ReviewServiceImpl.java - Service Implementation
// ============================================
package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.response.ReviewResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.Review;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.ReviewMapper;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.ReviewRepository;
import org.wisdom.oc01.service.ReviewService;
import org.wisdom.oc01.validator.ReviewValidator;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final ReviewValidator validator;
    private final ReviewMapper mapper;

    // ==================== CREATE ====================

    @Override
    @Transactional
    public ReviewResponse createReview(Integer accountId, Integer courseId, Integer rating, String comment) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));

        Review review = Review.builder()
                .account(account)
                .course(course)
                .rating(rating)
                .comment(comment)
                .build();

        validator.validateForCreate(review,
                reviewRepository.existsByCourseIdCourseAndAccountIdAccount(courseId, accountId));

        review = reviewRepository.save(review);
        return mapper.toResponse(review);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public ReviewResponse updateReview(Integer reviewId, Integer rating, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Đánh giá không tồn tại"));

        review.setRating(rating);
        review.setComment(comment);

        validator.validateForUpdate(review);
        review = reviewRepository.save(review);
        return mapper.toResponse(review);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void deleteReview(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Đánh giá không tồn tại"));
        reviewRepository.delete(review);
    }

    // ==================== GET ====================

    @Override
    public ReviewResponse getReviewByAccountAndCourse(Integer accountId, Integer courseId) {
        Review review = reviewRepository.findByCourseIdCourseAndAccountIdAccount(courseId, accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Chưa đánh giá khóa học này"));
        return mapper.toResponse(review);
    }

    @Override
    public Page<ReviewResponse> getReviewsByCourse(Integer courseId, Pageable pageable) {
        return reviewRepository.findByCourseIdCourseOrderByCreatedAtDesc(courseId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsByAccount(Integer accountId, Pageable pageable) {
        return reviewRepository.findByAccountIdAccountOrderByCreatedAtDesc(accountId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public Double getAverageRating(Integer courseId) {
        return reviewRepository.getAverageRatingByCourseId(courseId);
    }

    @Override
    public Long countReviewsByCourse(Integer courseId) {
        return reviewRepository.countByCourseIdCourse(courseId);
    }
}