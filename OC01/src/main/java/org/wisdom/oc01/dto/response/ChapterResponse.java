// ============================================
// ChapterResponse.java - Response DTO
// ============================================
package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChapterResponse {

    private Integer id;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer courseId;
    private List<CourseResourceResponse> resources; // ✅ Đổi lessons → resources
    private Integer totalResources;                 // ✅ Đổi totalLessons → totalResources
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}