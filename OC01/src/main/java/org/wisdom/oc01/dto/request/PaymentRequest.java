// ============================================
// PaymentRequest.java - Request DTO
// ============================================
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {

    @NotNull(message = "orderId không được để trống")
    private Integer orderId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(regexp = "^(STRIPE|VNPAY|MOMO|PAYPAL|BANK_TRANSFER|CARD)$",
            message = "Phương thức thanh toán không hợp lệ")
    private String paymentMethod;

    // ✅ Số tiền gốc theo SGD (giữ lại cho tương thích)
    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền phải là số dương")
    private BigDecimal amount;

    private String transactionId;

    // ✅ NEW: Currency user đang xem + số tiền theo currency đó
    // VD: user xem VND → currency = 'VND', paidAmount = 152070000
    //     user xem USD → currency = 'USD', paidAmount = 6082.80
    private String currency;
    private BigDecimal paidAmount;
}