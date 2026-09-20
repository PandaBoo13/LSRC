// src/main/java/org/wisdom/oc01/dto/response/chat/ParticipantResponse.java
package org.wisdom.oc01.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ParticipantResponse {
    private Integer id;
    private Integer conversationId;
    private Integer accountId;
    private String username;
    private String avatarUrl;
    private Boolean isAdmin;

    // ✅ THÊM CÁC FIELD MỚI
    private String roleInConversation; // OWNER, ADMIN, MODERATOR, MEMBER
    private String chatStatus; // ACTIVE, MUTED, BANNED
    private LocalDateTime mutedUntil;
    private String mutedReason;
    private String banReason;

    private Integer lastReadMessageId;
    private Integer unreadCount;
    private String lastMessagePreview;
    private LocalDateTime joinedAt;

}