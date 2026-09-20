// UpdateScoreRequest.java
package org.wisdom.oc01.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateScoreRequest {
    private BigDecimal score;
    private BigDecimal maxScore;
    private Boolean isPassed;
}