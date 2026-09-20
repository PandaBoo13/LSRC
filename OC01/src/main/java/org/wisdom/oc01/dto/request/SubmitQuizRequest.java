package org.wisdom.oc01.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SubmitQuizRequest {
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal passingScore;
    private Integer timeSpentSeconds;
}