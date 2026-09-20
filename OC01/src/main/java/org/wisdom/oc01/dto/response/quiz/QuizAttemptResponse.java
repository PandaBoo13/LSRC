// ============================================
// QuizAttemptResponse.java
// ============================================
package org.wisdom.oc01.dto.response.quiz;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizAttemptResponse {

    // ==================== ATTEMPT INFO ====================
    private Integer attemptId;
    private Integer quizId;
    private String quizTitle;
    private Integer accountId;
    private String username;
    private Integer attemptNumber;

    // ==================== SCORE ====================
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal passingScore;
    private Boolean isPassed;
    private String status;

    // ==================== TIME ====================
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeSpent;

    // ==================== ANSWERS ====================
    /** JSON string chứa đáp án học viên đã chọn. */
    private String answers;

    // ==================== QUESTIONS ====================
    /**
     * Danh sách câu hỏi của attempt.
     *
     * LƯU Ý BẢO MẬT:
     *  - Khi attempt IN_PROGRESS: chỉ có content/options/points → KHÔNG có đáp án.
     *  - Khi attempt GRADED/TIMEOUT/SUBMITTED: có thêm correctAnswer + explanation
     *    để học viên review sau khi nộp bài.
     *
     * Việc populate được kiểm soát ở QuizAttemptMapper.toResponse()
     * thông qua param `isFinished`.
     */
    private List<QuestionItem> questions;

    @Data
    @Builder
    public static class QuestionItem {
        private Integer questionId;
        private String content;
        private String questionType;
        private List<OptionItem> options;
        private BigDecimal points;

        // ==================== REVIEW FIELDS ====================
        /**
         * Đáp án đúng của câu hỏi.
         * CHỈ được populate khi attempt đã GRADED/TIMEOUT/SUBMITTED.
         * Trước khi nộp bài → null.
         */
        private List<String> correctAnswer;

        /**
         * Giải thích đáp án.
         * CHỈ được populate khi attempt đã kết thúc.
         */
        private String explanation;
    }

    @Data
    @Builder
    public static class OptionItem {
        private String label;
        private String content;
    }
}