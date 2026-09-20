package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OrderStatusRequest {

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(PENDING|PAID|FAILED|CANCELLED)$",
            message = "Trạng thái không hợp lệ")
    private String status;
}