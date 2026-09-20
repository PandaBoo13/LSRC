// src/main/java/org/wisdom/oc01/entity/chat/ChatConversation.java
package org.wisdom.oc01.entity.chat;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "chat_conversation")
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conversation")
    private Integer idConversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "conversation_type", nullable = false, length = 20)
    private ConversationType conversationType = ConversationType.PRIVATE;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "last_message_id")
    private Integer lastMessageId;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    // ✅ NEW: Quyền gửi tin nhắn trong conversation
    @Enumerated(EnumType.STRING)
    @Column(name = "message_permission", nullable = false, length = 20)
    private MessagePermission messagePermission = MessagePermission.EVERYONE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonManagedReference("conversation-participants")
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatParticipant> participants = new ArrayList<>();

    @JsonManagedReference("conversation-messages")
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatMessage> messages = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.conversationType == null) this.conversationType = ConversationType.PRIVATE;
        if (this.messagePermission == null) this.messagePermission = MessagePermission.EVERYONE;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ConversationType {
        PRIVATE, GROUP, COURSE
    }

    // ✅ NEW: Enum quyền gửi tin nhắn
    public enum MessagePermission {
        EVERYONE,       // Mọi thành viên đều gửi được
        ADMINS_ONLY     // Chỉ OWNER/ADMIN/MODERATOR gửi được
    }
}