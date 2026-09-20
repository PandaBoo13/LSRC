// ============================================
// UpdatePaymentResultRequest.java - Request DTO
// ============================================
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdatePaymentResultRequest {

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(SUCCESS|FAILED|CANCELLED)$", message = "Trạng thái không hợp lệ")
    private String status;

    private String transactionId;

    private String gatewayResponse;
}