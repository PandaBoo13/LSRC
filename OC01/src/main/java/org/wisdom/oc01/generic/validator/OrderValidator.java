package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.Order;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;

@Component
public class OrderValidator {

    // ==================== VALIDATE TỔNG QUÁT ====================

    public void validate(Order order) {
        validateAccount(order);
        validateAmounts(order);
        validateStatus(order);
        validateInvoiceInfo(order);
    }

    // ==================== VALIDATE THEO TỪNG TRƯỜNG HỢP ====================

    public void validateForCreate(Order order) {
        validate(order);
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Đơn hàng phải có ít nhất một khóa học");
        }
    }

    public void validateForPayment(Order order) {
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Đơn hàng không ở trạng thái chờ thanh toán");
        }
    }

    public void validateForCancel(Order order) {
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Chỉ có thể hủy đơn hàng ở trạng thái chờ thanh toán");
        }
    }

    /**
     * ✅ Validate đơn hàng miễn phí: số tiền cuối cùng phải = 0.
     * Dùng trong OrderServiceImpl.createOrder khi phát hiện đơn miễn phí.
     */
    public void validateForFreeEnrollment(Order order) {
        if (order.getFinalAmount() == null
                || order.getFinalAmount().compareTo(BigDecimal.ZERO) != 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Đơn hàng miễn phí phải có số tiền cuối cùng bằng 0");
        }
        validate(order);
    }

    // ==================== VALIDATE TỪNG FIELD ====================

    private void validateAccount(Order order) {
        if (order.getAccount() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Đơn hàng phải có khách hàng");
        }
    }

    private void validateAmounts(Order order) {
        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tổng tiền không được âm");
        }
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Giảm giá không được âm");
        }
        if (order.getFinalAmount() == null || order.getFinalAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số tiền cuối cùng không được âm");
        }
        if (order.getFinalAmount().compareTo(order.getTotalAmount()) > 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số tiền cuối cùng không được lớn hơn tổng tiền");
        }
    }

    private void validateStatus(Order order) {
        if (order.getStatus() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không được để trống");
        }
    }

    private void validateInvoiceInfo(Order order) {
        if (order.getInvoiceNumber() != null && order.getInvoiceNumber().length() > 50) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số hóa đơn không được vượt quá 50 ký tự");
        }
        if (order.getBuyerName() != null && order.getBuyerName().length() > 100) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tên người mua không được vượt quá 100 ký tự");
        }
        if (order.getBuyerEmail() != null
                && !order.getBuyerEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Email người mua không hợp lệ");
        }
    }

    // ==================== VALIDATE ENUM ====================

    public Order.OrderStatus validateStatus(String status) {
        if (status == null) return null;
        try {
            return Order.OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ");
        }
    }
}