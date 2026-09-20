// ============================================
// NotificationMapper.java - FIXED (BỎ TYPE)
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.NotificationResponse;
import org.wisdom.oc01.entity.notification.Notification;
import org.wisdom.oc01.entity.notification.NotificationRecipient;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Entity → Response.
     */
    public NotificationResponse toResponse(Notification notification, NotificationRecipient recipient) {
        return NotificationResponse.builder()
                .id(notification.getIdNotification())
                .senderId(notification.getSender() != null ? notification.getSender().getIdAccount() : null)
                .senderName(notification.getSender() != null ? notification.getSender().getUsername() : "Hệ thống")
                // ❌ BỎ: .notificationType(...)
                .title(notification.getTitle())
                .content(notification.getContent())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .extraData(notification.getExtraData())
                .isRead(recipient.getIsRead())
                .readAt(recipient.getReadAt())
                .receivedAt(recipient.getReceivedAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    /**
     * Entity → JSON (cho WebSocket).
     */
    public String toJson(Notification notification, NotificationRecipient recipient) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", notification.getIdNotification());
            data.put("senderId", notification.getSender() != null ? notification.getSender().getIdAccount() : null);
            data.put("senderName", notification.getSender() != null ? notification.getSender().getUsername() : "Hệ thống");
            // ❌ BỎ: data.put("notificationType", ...)
            data.put("title", notification.getTitle());
            data.put("content", notification.getContent());
            data.put("referenceType", notification.getReferenceType());
            data.put("referenceId", notification.getReferenceId());
            data.put("extraData", notification.getExtraData());
            data.put("isRead", recipient.getIsRead());
            data.put("readAt", recipient.getReadAt() != null ? recipient.getReadAt().toString() : null);
            data.put("receivedAt", recipient.getReceivedAt() != null ? recipient.getReceivedAt().toString() : null);
            data.put("createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null);

            String json = objectMapper.writeValueAsString(data);
            return json;
        } catch (Exception e) {
            System.out.println("❌ toJson lỗi: " + e.getMessage());
            return null;
        }
    }
}