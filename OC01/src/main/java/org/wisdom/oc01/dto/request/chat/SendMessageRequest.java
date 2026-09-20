// src/main/java/org/wisdom/oc01/dto/request/chat/SendMessageRequest.java
package org.wisdom.oc01.dto.request.chat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotNull(message = "conversationId không được để trống")
    private Integer conversationId;

    @NotNull(message = "senderId không được để trống")
    private Integer senderId;

    private String messageType; // TEXT, IMAGE, FILE, VIDEO, AUDIO, SYSTEM

    private String content;

    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private String fileFormat;

    private Integer replyToMessageId;
}