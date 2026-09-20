// src/main/java/org/wisdom/oc01/entity/NotificationRecipient.java
package org.wisdom.oc01.entity.notification;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.wisdom.oc01.entity.Account;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "notification_recipient")
public class NotificationRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recipient")
    private Integer idRecipient;

    @JsonBackReference("notification-recipients")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @JsonBackReference("account-received-notifications")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "received_at", updatable = false)
    private LocalDateTime receivedAt;

    @PrePersist
    public void prePersist() {
        this.receivedAt = LocalDateTime.now();
        if (this.isRead == null) this.isRead = false;
    }
}