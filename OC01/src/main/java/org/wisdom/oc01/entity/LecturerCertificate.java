// ============================================
// LecturerCertificate.java
// ============================================
package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "lecturer_certificate")
public class LecturerCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonBackReference("lecturer-certificates")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_profile_id", nullable = false)
    private LecturerProfile lecturerProfile;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "issuing_organization", length = 255)
    private String issuingOrganization;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "credential_url", length = 500)
    private String credentialUrl;

    @Column(name = "certificate_file", length = 500)
    private String certificateFile;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}