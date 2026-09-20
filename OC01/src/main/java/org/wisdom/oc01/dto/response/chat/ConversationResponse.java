// src/main/java/org/wisdom/oc01/dto/response/chat/ConversationResponse.java
package org.wisdom.oc01.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConversationResponse {
    private Integer id;
    private String conversationType;
    private String name;
    private Integer courseId;
    private Integer createdBy;
    private Integer lastMessageId;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String messagePermission;   // "EVERYONE" | "ADMINS_ONLY"
    // Thông tin thêm cho mỗi user
    private Integer unreadCount;
    private String lastMessagePreview;
    private List<ParticipantInfo> participants;
    private MessageInfo lastMessage;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ParticipantInfo {
        private Integer accountId;
        private String username;
        private String avatarUrl;
        private Boolean isAdmin;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MessageInfo {
        private Integer id;
        private String content;
        private String messageType;
        private LocalDateTime createdAt;
    }
}