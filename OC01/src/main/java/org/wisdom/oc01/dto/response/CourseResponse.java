package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseResponse {

    private Integer id;
    private String title;
    private String slug;
    private String description;
    private String thumbnailUrl;

    // ==================== ✅ THÊM BACKGROUND ====================
    private String backgroundThumbnail;
    private String backgroundType;

    private String level;
    private String duration;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Boolean isFree;
    private Boolean hasCertificate;
    private String accessPeriod;
    private String outcomes;
    private String status;
    private LocalDateTime publishedAt;
    private String courseType;
    private String language;
    private String progressType;
    private InstructorInfo instructor;
    private CategoryInfo category;
    private PrerequisiteInfo prerequisite;
    private Long totalStudents;
    private Long totalLessons;
    private Double averageRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ==================== INNER CLASSES ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InstructorInfo {
        private Integer id;
        private String firstName;
        private String lastName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CategoryInfo {
        private String id;
        private String name;
        private String slug;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PrerequisiteInfo {
        private Integer id;
        private String title;
        private String slug;
        private Boolean isRequired;
    }
}