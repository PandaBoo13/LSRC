// ============================================
// OrderItemValidator.java - Validator
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.OrderItem;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;

@Component
public class OrderItemValidator {

    public void validate(OrderItem orderItem) {
        validateOrder(orderItem);
        validateAccount(orderItem);
        validateCourse(orderItem);
        validatePrices(orderItem);
        validateProgress(orderItem);
        validateStatus(orderItem);
    }

    public void validateForUpdate(OrderItem orderItem) {
        validate(orderItem);
    }

    public void validateForComplete(OrderItem orderItem) {
        if (orderItem.getStatus() != OrderItem.EnrollmentStatus.ACTIVE) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể hoàn thành khóa học đang ở trạng thái ACTIVE");
        }
    }

    public void validateForDrop(OrderItem orderItem) {
        if (orderItem.getStatus() != OrderItem.EnrollmentStatus.ACTIVE) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể bỏ khóa học đang ở trạng thái ACTIVE");
        }
    }

    private void validateOrder(OrderItem orderItem) {
        if (orderItem.getOrder() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Order item phải thuộc một đơn hàng");
        }
    }

    private void validateAccount(OrderItem orderItem) {
        if (orderItem.getAccount() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Order item phải có account");
        }
    }

    private void validateCourse(OrderItem orderItem) {
        if (orderItem.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Order item phải có khóa học");
        }
    }

    private void validatePrices(OrderItem orderItem) {
        if (orderItem.getPrice() == null || orderItem.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Giá không được âm");
        }
        if (orderItem.getDiscount() != null && orderItem.getDiscount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Giảm giá không được âm");
        }
        if (orderItem.getFinalPrice() == null || orderItem.getFinalPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Giá cuối cùng không được âm");
        }
    }

    private void validateProgress(OrderItem orderItem) {
        if (orderItem.getProgress() != null
                && (orderItem.getProgress().compareTo(BigDecimal.ZERO) < 0
                || orderItem.getProgress().compareTo(new BigDecimal("100")) > 0)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiến độ phải từ 0 đến 100");
        }
    }

    private void validateStatus(OrderItem orderItem) {
        if (orderItem.getStatus() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không được để trống");
        }
    }
}