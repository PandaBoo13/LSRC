// ============================================
// QuizResponse.java - Thông tin quiz
// ============================================
package org.wisdom.oc01.dto.response.quiz;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class QuizResponse {
    private Integer quizId;
    private String title;
    private String description;
    private Integer courseId;
    private String courseTitle;
    private Integer timeLimit;
    private Integer maxAttempts;
    private BigDecimal passingScore;
    private Boolean shuffleQuestions;
    private Boolean shuffleAnswers;
    private Integer totalQuestions;
    private String status;
    private Integer questionCount;
    private LocalDateTime createdAt;
}