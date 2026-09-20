package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_course")
    private Integer idCourse;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "slug", nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    // ==================== ✅ THÊM BACKGROUND ====================

    @Column(name = "background_thumbnail", length = 500)
    private String backgroundThumbnail; // Gradient CSS, pattern URL, hoặc image URL

    @Enumerated(EnumType.STRING)
    @Column(name = "background_type", length = 20)
    private BackgroundType backgroundType; // GRADIENT, PATTERN, IMAGE, SOLID

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 20)
    private Level level = Level.ALL_LEVELS;

    @Column(name = "duration", length = 50)
    private String duration;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "is_free")
    private Boolean isFree = false;

    @Column(name = "has_certificate")
    private Boolean hasCertificate = false;

    @Column(name = "access_period", length = 50)
    private String accessPeriod = "Lifetime";

    @Column(name = "outcomes", columnDefinition = "JSON")
    private String outcomes;

    @Column(name = "language", length = 10)
    private String language = "vi";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CourseStatus status = CourseStatus.DRAFT;

    @JsonBackReference("account-courses")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @JsonBackReference("category-courses")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @JsonBackReference("course-prerequisite-ref")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prerequisite_course_id")
    private Course prerequisiteCourse;

    @JsonManagedReference("course-chapters")
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    private List<Chapter> chapters = new ArrayList<>();

    @JsonManagedReference("course-resources")
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseResource> resources = new ArrayList<>();

    @JsonManagedReference("course-reviews")
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews = new ArrayList<>();

    @JsonManagedReference("course-progress-list")
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Progress> progressList = new ArrayList<>();

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_type", length = 20)
    private CourseType courseType = CourseType.SELF_PACED;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_type", length = 20)
    private ProgressType progressType = ProgressType.COMPLETION_BASED;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isFree == null) this.isFree = false;
        if (this.price == null) this.price = BigDecimal.ZERO;
        if (this.status == null) this.status = CourseStatus.DRAFT;
        if (this.level == null) this.level = Level.ALL_LEVELS;
        if (this.language == null) this.language = "vi";
        if (this.progressType == null) this.progressType = ProgressType.COMPLETION_BASED;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Level { BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS }
    public enum CourseStatus { DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED }
    public enum CourseType { SELF_PACED, LIVE }
    public enum ProgressType { COMPLETION_BASED, WEIGHTED_GRADE }

    // ✅ THÊM ENUM
    public enum BackgroundType { GRADIENT, PATTERN, IMAGE, SOLID }
}