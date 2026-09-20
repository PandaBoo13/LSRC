// ============================================
// QuestionResponse.java - Response DTO (Thêm lessonId, lessonTitle)
// ============================================
package org.wisdom.oc01.dto.response.question;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class QuestionResponse {
    private Integer id;
    private Integer courseId;
    private String courseTitle;

    // ✅ THÊM
    private Integer lessonId;
    private String lessonTitle;

    private String content;
    private String questionType;
    private String options;
    private String correctAnswer;
    private String explanation;
    private String status;
    private Integer orderIndex;
    private BigDecimal points;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}