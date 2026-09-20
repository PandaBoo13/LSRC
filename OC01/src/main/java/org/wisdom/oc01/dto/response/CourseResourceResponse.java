package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseResourceResponse {
    private Integer id;
    private Integer courseId;
    private Integer chapterId;
    private Integer parentId;
    private String resourceType;
    private String title;
    private String slug;
    private String description;
    private Integer orderIndex;
    private Boolean isRequired;
    private String status;
    private String settings;

    // VIDEO lesson
    private Integer duration;
    private String content;
    private Boolean isFreePreview;
    private String thumbnailUrl;

    // File
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String fileFormat;
    private String mimeType;

    // QUIZ
    private Integer maxAttempts;
    private BigDecimal passingScore;
    private Integer timeLimit;
    private Boolean shuffleQuestions;
    private String hashtagFilter;
    private Integer totalQuestions;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}