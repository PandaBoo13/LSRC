// src/main/java/org/wisdom/oc01/dto/response/question/QuestionLearnerResponse.java
package org.wisdom.oc01.dto.response.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO dành cho LEARNER hoặc PUBLIC.
 * KHÔNG chứa correctAnswer / explanation để tránh lộ đáp án trước khi thi.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionLearnerResponse {

    private Integer id;
    private Integer courseId;
    private String courseTitle;
    private Integer lessonId;
    private String lessonTitle;
    private String content;
    private String questionType;
    private String options;        // JSON array options, KHÔNG có đáp án
    private String status;
    private Integer orderIndex;
    private BigDecimal points;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // KHÔNG có:
    // - correctAnswer
    // - explanation
}