package org.wisdom.oc01.dto.request.progress;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProgressScoreRequest {

    @DecimalMin(value = "0.0", message = "Điểm phải từ 0 đến 100")
    @DecimalMax(value = "100.0", message = "Điểm phải từ 0 đến 100")
    private BigDecimal score;

    @DecimalMin(value = "0.0", message = "Điểm tối đa phải >= 0")
    @DecimalMax(value = "100.0", message = "Điểm tối đa phải <= 100")
    private BigDecimal maxScore;

    private Boolean isPassed;
}