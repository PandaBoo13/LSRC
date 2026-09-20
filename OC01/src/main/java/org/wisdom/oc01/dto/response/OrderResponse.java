package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {

    private Integer id;
    private Integer accountId;
    private String username;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status;

    // Thanh toán
    private String paymentMethod;
    private String transactionId;
    private String gatewayResponse;
    private String paymentUrl;
    private LocalDateTime paidAt;
    private String paymentLog;

    // Hóa đơn
    private String invoiceNumber;
    private String buyerName;
    private String buyerEmail;
    private LocalDateTime invoiceIssuedAt;

    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OrderItemResponse {
        private Integer id;
        private Integer accountId;      // ✅ THÊM FIELD NÀY
        private Integer courseId;
        private String courseTitle;
        private String courseSlug;
        private String courseThumbnailUrl;
        private BigDecimal price;
        private BigDecimal discount;
        private BigDecimal finalPrice;
        private String enrollmentType;
        private BigDecimal progress;
        private String status;
        private LocalDateTime completedAt;
    }
}