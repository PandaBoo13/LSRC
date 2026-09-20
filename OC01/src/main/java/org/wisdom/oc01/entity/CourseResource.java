package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "course_resource")
public class CourseResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resource")
    private Integer idResource;

    @JsonBackReference("course-resources")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CourseResource parent;

    // ==================== DÙNG CHUNG ====================
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "slug", length = 255)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 20)
    private ResourceType resourceType;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private Status status = Status.DRAFT;

    @Column(name = "settings", columnDefinition = "JSON")
    private String settings;

    // ==================== VIDEO LESSON ====================
    @Column(name = "duration")
    private Integer duration = 0;

    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "is_free_preview")
    private Boolean isFreePreview = false;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    // ==================== FILE ====================
    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_format", length = 50)
    private String fileFormat;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    // ==================== QUIZ ====================
    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "passing_score", precision = 5, scale = 2)
    private java.math.BigDecimal passingScore = java.math.BigDecimal.valueOf(80.00);

    @Column(name = "time_limit")
    private Integer timeLimit;

    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions = false;

    @Column(name = "hashtag_filter", length = 500)
    private String hashtagFilter;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.orderIndex == null) this.orderIndex = 0;
        if (this.isRequired == null) this.isRequired = false;
        if (this.status == null) this.status = Status.DRAFT;
        if (this.duration == null) this.duration = 0;
        if (this.isFreePreview == null) this.isFreePreview = false;
        if (this.shuffleQuestions == null) this.shuffleQuestions = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== ENUMS ====================
    public enum ResourceType {
        VIDEO, QUIZ, PDF, SLIDE, AUDIO, DOCUMENT, IMAGE, LINK, SCORM, OTHER,LESSON
    }

    public enum Status {
        DRAFT, HIDDEN, PUBLISHED, PROCESSING, READY, ERROR
    }
}