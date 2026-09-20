// ============================================
// Progress.java - Entity (Gộp CourseProgress + LessonProgress)
// ============================================
package org.wisdom.oc01.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "course_id", "progress_type", "reference_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // ==================== LOẠI PROGRESS ====================
    @Column(name = "progress_type", nullable = false, length = 50)
    private String progressType; // COURSE, RESOURCE, ASSIGNMENT, CERTIFICATE...

    @Column(name = "reference_id")
    private Integer referenceId; // FK tùy loại: resource_id, assignment_id...

    @Column(name = "reference_type", length = 50)
    private String referenceType; // course_resource, assignment...

    // ==================== DÙNG CHUNG ====================
    @Column(name = "status", length = 50)
    private String status = "NOT_STARTED"; // NOT_STARTED, IN_PROGRESS, COMPLETED, PASSED, FAILED

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Column(name = "total_time_spent")
    private Integer totalTimeSpent = 0;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore;

    @Column(name = "attempts")
    private Integer attempts = 1;

    @Column(name = "is_passed")
    private Boolean isPassed = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    // ==================== COURSE PROGRESS TỔNG HỢP ====================
    @Column(name = "total_items")
    private Integer totalItems = 0;

    @Column(name = "completed_items")
    private Integer completedItems = 0;

    @Column(name = "weighted_score", precision = 5, scale = 2)
    private BigDecimal weightedScore;

    @Column(name = "total_weight_percent", precision = 5, scale = 2)
    private BigDecimal totalWeightPercent;

    // ==================== DỮ LIỆU MỞ RỘNG ====================
    @Column(name = "extra_data", columnDefinition = "JSON")
    private String extraData;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (progressType == null) progressType = "COURSE";
        if (status == null) status = "NOT_STARTED";
        if (progressPercentage == null) progressPercentage = BigDecimal.ZERO;
        if (totalTimeSpent == null) totalTimeSpent = 0;
        if (attempts == null) attempts = 1;
        if (isPassed == null) isPassed = false;
        if (totalItems == null) totalItems = 0;
        if (completedItems == null) completedItems = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        lastAccessedAt = LocalDateTime.now();
    }

    // ==================== CONSTANTS ====================
    public static final String TYPE_COURSE = "COURSE";
    public static final String TYPE_RESOURCE = "RESOURCE";

    public static final String STATUS_NOT_STARTED = "NOT_STARTED";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_PASSED = "PASSED";
    public static final String STATUS_FAILED = "FAILED";
}