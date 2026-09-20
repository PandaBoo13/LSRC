package org.wisdom.oc01.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {
    private Integer id;
    private Integer accountId;
    private String username;
    private Integer courseId;
    private String courseTitle;
    private String courseSlug;

    private String progressType;
    private Integer referenceId;
    private String referenceType;

    private String status;
    private BigDecimal progressPercentage;
    private Integer totalTimeSpent;
    private BigDecimal score;
    private BigDecimal maxScore;
    private Integer attempts;
    private Boolean isPassed;
    private String notes;

    private Integer totalItems;
    private Integer completedItems;
    private BigDecimal weightedScore;
    private BigDecimal totalWeightPercent;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}