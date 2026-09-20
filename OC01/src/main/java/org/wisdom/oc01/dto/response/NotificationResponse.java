// src/main/java/org/wisdom/oc01/dto/response/NotificationResponse.java
package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    private Integer id;
    private Integer senderId;
    private String senderName;
    private String notificationType;
    private String title;
    private String content;

    // ✅ THÊM 2 FIELD
    private String referenceType;
    private Integer referenceId;

    private String extraData;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime receivedAt;
    private LocalDateTime createdAt;
}