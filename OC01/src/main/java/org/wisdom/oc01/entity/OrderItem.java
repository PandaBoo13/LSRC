// ============================================
// OrderItem.java - Entity (HOÀN CHỈNH)
// ============================================
package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "order_item")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonBackReference("order-items")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "discount", precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "final_price", precision = 10, scale = 2)
    private BigDecimal finalPrice;

    // ==================== ENROLLMENT INFO ====================
    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_type", length = 20)
    private EnrollmentType enrollmentType = EnrollmentType.ENROLLED;

    @Column(name = "progress", precision = 5, scale = 2)
    private BigDecimal progress = BigDecimal.ZERO;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    // ==================== ✅ THÊM TIMESTAMPS ====================

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.discount == null) this.discount = BigDecimal.ZERO;
        if (this.progress == null) this.progress = BigDecimal.ZERO;
        if (this.enrollmentType == null) this.enrollmentType = EnrollmentType.ENROLLED;
        if (this.status == null) this.status = EnrollmentStatus.ACTIVE;
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ==================== ENUMS ====================
    public enum EnrollmentType {
        ENROLLED,  // Đã ghi danh
        WAITING    // Chờ khai giảng
    }

    public enum EnrollmentStatus {
        ACTIVE,     // Đang học
        COMPLETED,  // Đã hoàn thành
        DROPPED,    // Đã bỏ học
        ARCHIVED    // Đã lưu trữ
    }
}