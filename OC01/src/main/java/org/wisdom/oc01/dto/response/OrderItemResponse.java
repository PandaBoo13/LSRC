// ============================================
// OrderItemResponse.java - Response DTO
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
public class OrderItemResponse {

    private Integer id;
    private Integer orderId;
    private Integer accountId;

    // ==================== COURSE INFO ====================
    private Integer courseId;
    private String courseTitle;
    private String courseSlug;
    private String courseThumbnailUrl;

    // ==================== PRICE INFO ====================
    private BigDecimal price;
    private BigDecimal discount;
    private BigDecimal finalPrice;

    // ==================== ENROLLMENT INFO ====================
    private String enrollmentType; // ENROLLED, WAITING
    private BigDecimal progress;
    private String status; // ACTIVE, COMPLETED, DROPPED, ARCHIVED
    private LocalDateTime completedAt;
}