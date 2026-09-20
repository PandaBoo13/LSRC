// ============================================
// LecturerProfile.java - Entity (Đã sửa user → account)
// ============================================
package org.wisdom.oc01.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lecturer_profile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LecturerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ✅ Đã đổi từ user_id sang account_id
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "specialties", columnDefinition = "JSON")
    private String specialties;

    @Column(name = "expertise", columnDefinition = "TEXT")
    private String expertise;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Column(name = "education", columnDefinition = "TEXT")
    private String education;

    @Column(name = "website", length = 500)
    private String website;

    @Column(name = "linkedin", length = 500)
    private String linkedin;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (experienceYears == null) experienceYears = 0;
        if (isActive == null) isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}