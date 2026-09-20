// UpdateLessonProgressRequest.java
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateLessonProgressRequest {

    @NotNull(message = "Tiến độ không được để trống")
    @DecimalMin(value = "0.0", message = "Tiến độ phải từ 0 đến 100")
    @DecimalMax(value = "100.0", message = "Tiến độ phải từ 0 đến 100")
    private BigDecimal percentage;
}