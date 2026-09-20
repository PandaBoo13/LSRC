package org.wisdom.oc01.dto.request.progress;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WeightedScoreUpdateRequest {

    @NotNull(message = "Điểm trọng số không được để trống")
    @DecimalMin(value = "0.0", message = "Điểm phải từ 0 đến 100")
    @DecimalMax(value = "100.0", message = "Điểm phải từ 0 đến 100")
    private BigDecimal score;

    private BigDecimal weightPercent;
}