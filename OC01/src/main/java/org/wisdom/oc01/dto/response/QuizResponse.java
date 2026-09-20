// ============================================
// QuizResponse.java - Response DTO
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
public class QuizResponse {

    private Integer id;
    private String title;
    private String description;
    private BigDecimal passingScore;
    private Integer timeLimit;
    private Integer maxAttempts;
    private Boolean showResultImmediately;
    private Boolean shuffleQuestions;
    private String status;
    private Integer courseId;
    private String courseTitle;
    private String hashtagFilter;
    private Integer totalQuestions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}