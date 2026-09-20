// ============================================
// QuizRequest.java - Tạo/Sửa Quiz
// ============================================
package org.wisdom.oc01.dto.request.quiz;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class QuizRequest {
    private String title;
    private String description;
    private Integer courseId;
    private Integer chapterId;
    private Integer timeLimit;
    private Integer maxAttempts;
    private BigDecimal passingScore;
    private Boolean shuffleQuestions;
    private Boolean shuffleAnswers;
    private Integer totalQuestions;
}