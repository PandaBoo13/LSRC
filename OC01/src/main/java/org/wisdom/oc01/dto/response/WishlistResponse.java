// ============================================
// WishlistResponse.java - Response DTO
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
public class WishlistResponse {

    private Integer id;
    private Integer accountId;
    private Integer courseId;
    private String courseTitle;
    private String courseSlug;
    private String courseThumbnailUrl;
    private BigDecimal coursePrice;
    private BigDecimal courseOldPrice;
    private Boolean courseIsFree;
    private String courseStatus;
    private LocalDateTime addedAt;
}