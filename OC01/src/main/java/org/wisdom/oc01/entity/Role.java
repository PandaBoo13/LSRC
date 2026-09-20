// Role.java
package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "role")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer idRole;

    @Column(name = "role_name", nullable = false, unique = true, length = 45)
    private String roleName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ==================== RELATIONSHIPS ====================

    @JsonIgnore
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Account> accounts = new ArrayList<>();

    // ==================== COMPUTED FIELDS ====================

    @JsonProperty("accountCount")
    public int getAccountCount() {
        return accounts != null ? accounts.size() : 0;
    }

    // ==================== CALLBACKS ====================

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}