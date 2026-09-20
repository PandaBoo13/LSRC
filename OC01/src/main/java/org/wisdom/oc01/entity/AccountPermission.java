// AccountPermission.java
package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_permission", indexes = {
        @Index(name = "idx_ap_account", columnList = "account_id"),
        @Index(name = "idx_ap_active", columnList = "is_active")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AccountPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_account_permission")
    private Integer idAccountPermission;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ==================== RELATIONSHIPS ====================

    @JsonBackReference("account-permissions")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_ap_account"))
    private Account account;

    @JsonBackReference("permission-accounts")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_ap_permission"))
    private Permission permission;

    // ==================== CALLBACKS ====================

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}