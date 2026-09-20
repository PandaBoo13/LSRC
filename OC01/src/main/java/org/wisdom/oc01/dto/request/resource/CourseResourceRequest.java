package org.wisdom.oc01.dto.request.resource;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class CourseResourceRequest {
    private String title;
    private String slug;
    private String description;
    private String resourceType;
    private Integer chapterId;
    private Integer parentId;
    private Integer orderIndex = 0;
    private Boolean isRequired = false;
    private String settings;

    // ✅ THÊM: cho phép FE đổi trạng thái qua update
    // "DRAFT" | "PUBLISHED" | "HIDDEN" | "READY" | "PROCESSING" | "ERROR"
    private String status;

    // VIDEO lesson
    private Integer duration;
    private String content;
    private Boolean isFreePreview = false;
    private String thumbnailUrl;

    // File
    private String fileName;
    private String fileUrl;
    private MultipartFile file;
    private Long fileSize;
    private String fileFormat;
    private String mimeType;

    // QUIZ
    private Integer maxAttempts;
    private BigDecimal passingScore = BigDecimal.valueOf(80.00);
    private Integer timeLimit;
    private Boolean shuffleQuestions = false;
    private String hashtagFilter;
    private Integer totalQuestions;
}