// src/main/java/org/wisdom/oc01/dto/request/SubmitQuizAttemptRequest.java
package org.wisdom.oc01.dto.request;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubmitQuizAttemptRequest {
    private Integer quizId;
    private Integer enrollmentId;
    private Integer courseId;
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal passingScore;
    private String answers; // JSON string
    private Integer timeSpent;
}