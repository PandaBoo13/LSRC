// ============================================
// ReviewValidator.java - Validator
// ============================================
package org.wisdom.oc01.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.Review;
import org.wisdom.oc01.exception.ErrorHandler;

@Component
public class ReviewValidator {

    public void validate(Review review) {
        validateCourse(review);
        validateAccount(review);
        validateRating(review);
        validateComment(review);
    }

    public void validateForCreate(Review review, boolean alreadyReviewed) {
        validate(review);
        if (alreadyReviewed) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Bạn đã đánh giá khóa học này rồi");
        }
    }

    public void validateForUpdate(Review review) {
        validate(review);
    }

    private void validateCourse(Review review) {
        if (review.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Đánh giá phải thuộc một khóa học");
        }
    }

    private void validateAccount(Review review) {
        if (review.getAccount() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Đánh giá phải có người đánh giá");
        }
    }

    private void validateRating(Review review) {
        if (review.getRating() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số sao không được để trống");
        }
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số sao phải từ 1 đến 5");
        }
    }

    private void validateComment(Review review) {
        if (review.getComment() != null && review.getComment().length() > 5000) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Bình luận không được vượt quá 5000 ký tự");
        }
    }
}