// ============================================
// LessonProgressResponse.java - Response DTO
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
public class LessonProgressResponse {

    private Integer id;
    private Integer lessonId;
    private String lessonTitle;
    private String lessonSlug;
    private Integer accountId;
    private Integer courseId;

    // ==================== PROGRESS INFO ====================
    private String status;
    private BigDecimal progressPercentage;
    private Integer timeSpent;
    private BigDecimal score;
    private BigDecimal maxScore;
    private Integer attempts;
    private Boolean isPassed;
    private String notes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastAccessedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}