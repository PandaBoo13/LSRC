// ============================================
// Question.java - Entity (Thêm lesson reference)
// ============================================
package org.wisdom.oc01.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "question")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_question")
    private Integer idQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // ✅ THÊM: Lesson reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private CourseResource lesson;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "options", columnDefinition = "JSON")
    private String options;

    @Column(name = "correct_answer", columnDefinition = "JSON")
    private String correctAnswer;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private QuestionStatus status = QuestionStatus.ACTIVE;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "points", precision = 5, scale = 2)
    private BigDecimal points = BigDecimal.ONE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (points == null) points = BigDecimal.ONE;
        if (status == null) status = QuestionStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum QuestionType {
        SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
    }

    public enum QuestionStatus {
        ACTIVE, INACTIVE
    }
}