package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "account")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_account")
    private Integer idAccount;

    @Column(name = "username", nullable = false, length = 225)
    private String username;

    @Column(name = "password", length = 225)
    private String password;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "provider", length = 255)
    private String provider;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    private User user;

    // ✅ THÊM: Quan hệ với AccountPermission
    @JsonManagedReference("account-permissions")
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccountPermission> accountPermissions = new ArrayList<>();

    @JsonManagedReference("account-courses")
    @OneToMany(mappedBy = "account")
    private List<Course> courses = new ArrayList<>();

    @JsonManagedReference("account-reviews")
    @OneToMany(mappedBy = "account")
    private List<Review> reviews = new ArrayList<>();

    @JsonManagedReference("account-order-items")
    @OneToMany(mappedBy = "account")
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}