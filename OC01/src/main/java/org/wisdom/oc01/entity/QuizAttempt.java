// ============================================
// QuizAttempt.java - FIXED (Thêm Status enum)
// ============================================
package org.wisdom.oc01.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempt")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_attempt")
    private Integer idAttempt;

    // ✅ Đổi từ Quiz → CourseResource
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private CourseResource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "answers", columnDefinition = "JSON")
    private String answers;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    @Column(name = "is_passed")
    private Boolean isPassed = false;

    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore;

    @Column(name = "passing_score", precision = 5, scale = 2)
    private BigDecimal passingScore;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    // ✅ THÊM: Status enum
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private QuizAttemptStatus status = QuizAttemptStatus.IN_PROGRESS;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "time_spent")
    private Integer timeSpent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = QuizAttemptStatus.IN_PROGRESS;
        if (isPassed == null) isPassed = false;
        if (attemptNumber == null) attemptNumber = 1;
        if (timeSpent == null) timeSpent = 0;
        if (score == null) score = BigDecimal.ZERO;
        if (maxScore == null) maxScore = BigDecimal.ZERO;
    }

    // ==================== ENUM ====================

    public enum QuizAttemptStatus {
        IN_PROGRESS,    // Đang làm bài
        SUBMITTED,      // Đã submit
        GRADED,         // Đã chấm điểm
        TIMEOUT         // Hết thời gian
    }
}