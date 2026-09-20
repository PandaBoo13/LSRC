// ============================================
// QuizAttemptResponse.java - Response DTO
// ============================================
package org.wisdom.oc01.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizAttemptResponse {

    // Attempt info
    private Integer attemptId;
    private Integer quizId;
    private String quizTitle;
    private Integer accountId;
    private String username;
    private Integer attemptNumber;

    // Score
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal passingScore;
    private Boolean isPassed;
    private String status; // IN_PROGRESS, SUBMITTED, GRADED, TIMEOUT

    // Time
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeSpent;

    // ✅ Câu hỏi (khi bắt đầu attempt - KHÔNG có đáp án đúng)
    private List<QuestionItem> questions;

    // ==================== NESTED CLASSES ====================

    @Data
    @Builder
    public static class QuestionItem {
        private Integer questionId;
        private String content;
        private String questionType;
        private List<OptionItem> options;
        private BigDecimal points;
    }

    @Data
    @Builder
    public static class OptionItem {
        private String label;
        private String content;
    }
}