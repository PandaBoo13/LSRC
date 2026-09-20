// src/main/java/org/wisdom/oc01/controller/notification/NotificationWebSocketController.java
package org.wisdom.oc01.controller.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.service.notification.NotificationService;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class NotificationWebSocketController {

    private final NotificationService notificationService;
    private final AccountRepository accountRepository;

    /**
     * Nhận yêu cầu gửi notification qua WebSocket
     * Client gửi đến: /app/notification/send
     */
    @MessageMapping("/notification/send")
    public void sendNotification(@Payload NotificationRequest request, Principal principal) {
        if (principal == null) {
            log.warn("⚠️ Principal null khi gửi notification");
            return;
        }

        Account sender = accountRepository.findByUsername(principal.getName()).orElse(null);
        if (sender != null) {
            request.setSenderAccountId(sender.getIdAccount());
        }

        log.info("📨 Gửi notification qua WebSocket từ {}", sender != null ? sender.getUsername() : "unknown");
        notificationService.sendNotification(request);
    }

    /**
     * Đánh dấu đã đọc qua WebSocket
     * Client gửi đến: /app/notification/read
     */
    @MessageMapping("/notification/read")
    public void markAsRead(@Payload java.util.Map<String, Object> payload, Principal principal) {
        if (principal == null) return;

        Account currentAccount = accountRepository.findByUsername(principal.getName()).orElse(null);
        if (currentAccount == null) return;

        Integer notificationId = payload.get("notificationId") != null
                ? Integer.parseInt(payload.get("notificationId").toString())
                : null;

        if (notificationId != null) {
            notificationService.markAsRead(notificationId, currentAccount.getIdAccount());
            log.info("✅ User {} đã đọc notification {} qua WebSocket", currentAccount.getUsername(), notificationId);
        }
    }
}