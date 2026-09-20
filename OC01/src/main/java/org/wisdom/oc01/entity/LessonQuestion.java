// ============================================
// LessonQuestion.java - Entity
// ============================================
package org.wisdom.oc01.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_question", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"resource_id", "question_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LessonQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ✅ FK → course_resource (lesson video hoặc quiz)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private CourseResource resource;

    // ✅ FK → question
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "points", precision = 5, scale = 2)
    private BigDecimal points = BigDecimal.ONE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (orderIndex == null) orderIndex = 0;
        if (points == null) points = BigDecimal.ONE;
    }
}