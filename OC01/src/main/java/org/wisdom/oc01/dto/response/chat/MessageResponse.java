// src/main/java/org/wisdom/oc01/dto/response/chat/MessageResponse.java
package org.wisdom.oc01.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessageResponse {
    private Integer id;
    private Integer conversationId;
    private Integer senderId;
    private String senderUsername;
    private String senderAvatarUrl;
    private String messageType;
    private String content;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private String fileFormat;
    private Integer replyToMessageId;
    private Boolean isDeleted;
    private Boolean isEdited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}