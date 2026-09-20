// ============================================
// CourseProgressResponse.java - Response DTO
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
public class CourseProgressResponse {

    private Integer id;
    private Integer accountId;
    private String username;          // ✅ THÊM MỚI
    private Integer courseId;
    private String courseTitle;
    private String courseSlug;

    // ==================== PROGRESS INFO ====================
    private Integer totalLessons;
    private Integer totalExams;
    private Integer completedLessons;
    private Integer completedExams;
    private BigDecimal progressPercentage;
    private Integer totalTimeSpent;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String status;

    // ==================== WEIGHTED SCORE ====================
    private BigDecimal weightedScore;
    private BigDecimal totalWeightPercent;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}