// ============================================
// UpdateOrderRequest.java - Request DTO
// ============================================
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderRequest {

    @NotNull(message = "ID không được để trống")
    private Integer idChapter;

    @NotNull(message = "Thứ tự không được để trống")
    @Min(value = 0, message = "Thứ tự không được âm")
    private Integer orderIndex;
}