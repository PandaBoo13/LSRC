// ============================================
// LessonResponse.java - Response DTO
// ============================================
package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LessonResponse {

    private Integer id;
    private String title;
    private String slug;
    private String description;
    private String content;
    private Integer duration;
    private Integer orderIndex;
    private Boolean isFreePreview;
    private String settings;
    private String status;
    private Integer chapterId;
    private String chapterTitle;
    private Integer courseId;
    private String courseTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}