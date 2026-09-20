// src/main/java/org/wisdom/oc01/entity/ChatMessage.java
package org.wisdom.oc01.entity.chat;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Integer idMessage;

    @JsonBackReference("conversation-messages")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 20)
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_format", length = 50)
    private String fileFormat;

    @Column(name = "reply_to_message_id")
    private Integer replyToMessageId;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "is_edited")
    private Boolean isEdited = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.messageType == null) this.messageType = MessageType.TEXT;
        if (this.isDeleted == null) this.isDeleted = false;
        if (this.isEdited == null) this.isEdited = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum MessageType {
        TEXT, IMAGE, FILE, VIDEO, AUDIO, SYSTEM
    }
}