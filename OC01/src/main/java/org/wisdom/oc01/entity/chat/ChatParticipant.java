// src/main/java/org/wisdom/oc01/entity/chat/ChatParticipant.java
package org.wisdom.oc01.entity.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participant")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participant")
    private Integer idParticipant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @Column(name = "account_id", nullable = false)
    private Integer accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_conversation", nullable = false, length = 20)
    private ConversationRole roleInConversation = ConversationRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(name = "chat_status", nullable = false, length = 20)
    private ChatStatus chatStatus = ChatStatus.ACTIVE;

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil;

    @Column(name = "muted_reason", length = 255)
    private String mutedReason;

    @Column(name = "ban_reason", length = 255)
    private String banReason;

    @Column(name = "is_admin")
    private Boolean isAdmin = false;

    @Column(name = "last_read_message_id")
    private Integer lastReadMessageId;

    @Column(name = "unread_count")
    private Integer unreadCount = 0;

    @Column(name = "last_message_preview", length = 255)
    private String lastMessagePreview;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    // ✅ HARD DELETE: Đã xóa field leftAt
    // (Không cần nữa vì participant bị xóa cứng khi rời nhóm)

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) joinedAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (roleInConversation == null) roleInConversation = ConversationRole.MEMBER;
        if (chatStatus == null) chatStatus = ChatStatus.ACTIVE;
        if (unreadCount == null) unreadCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==================== ENUMS ====================

    public enum ConversationRole {
        OWNER, ADMIN, MODERATOR, MEMBER
    }

    public enum ChatStatus {
        ACTIVE, MUTED, BANNED
    }
}