package org.wisdom.oc01.entity.notification;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.wisdom.oc01.entity.Account;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "notification")              // ✅ sửa: notification → notifications
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")       // ✅ thêm @Column
    private Integer idNotification;

    // ✅ THÊM field khớp cột DB
    @Column(name = "notification_type", length = 50)
    private String notificationType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Column(name = "extra_data", columnDefinition = "JSON")
    private String extraData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_account_id")
    private Account sender;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}