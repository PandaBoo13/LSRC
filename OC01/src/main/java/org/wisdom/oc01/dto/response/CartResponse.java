// ============================================
// CartResponse.java
// ============================================
package org.wisdom.oc01.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private List<CartItemResponse> items;
    private long totalItems;
    private BigDecimal totalAmount;

    @Data
    @Builder
    public static class CartItemResponse {
        private Integer id;
        private Integer courseId;
        private String courseTitle;
        private String courseSlug;
        private String courseThumbnail;
        private BigDecimal price;
        private String instructorName;
        private LocalDateTime addedAt;
    }
}