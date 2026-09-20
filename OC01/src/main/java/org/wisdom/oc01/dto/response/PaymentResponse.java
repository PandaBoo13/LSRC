// ============================================
// PaymentResponse.java - Response DTO
// ============================================
package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {

    private Integer id;
    private Integer orderId;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private String transactionId;
    private String gatewayResponse;
    private String paymentUrl;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}