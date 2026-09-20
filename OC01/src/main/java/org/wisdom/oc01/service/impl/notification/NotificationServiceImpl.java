// ============================================================
// NotificationServiceImpl.java - TỐI ƯU HIỆU NĂNG
// ============================================================
package org.wisdom.oc01.service.impl.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.dto.response.NotificationResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.notification.Notification;
import org.wisdom.oc01.entity.notification.NotificationRecipient;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.NotificationMapper;
import org.wisdom.oc01.generic.validator.NotificationValidator;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.notification.NotificationRecipientRepository;
import org.wisdom.oc01.repository.notification.NotificationRepository;
import org.wisdom.oc01.service.notification.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository recipientRepository;
    private final AccountRepository accountRepository;
    private final NotificationMapper mapper;
    private final NotificationValidator validator;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== SEND NOTIFICATION ====================
    @Override @Transactional
    public void sendNotification(NotificationRequest request) {
        validator.validateForSend(request);
        List<Integer> receiverIds = resolveReceivers(request);
        log.info("🔔 SEND: Receivers={}", receiverIds.size());
        if (receiverIds.isEmpty()) {
            log.warn("⚠️ Không có người nhận");
            return;
        }
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        notification.setReferenceType(request.getReferenceType());
        notification.setReferenceId(request.getReferenceId());
        notification.setExtraData(convertExtraDataToJson(request.getExtraData()));
        if (request.getSenderAccountId() != null) {
            notification.setSender(accountRepository.getReferenceById(request.getSenderAccountId()));
        }
        notification = notificationRepository.save(notification);
        log.info("✅ Đã tạo notification: ID={}", notification.getIdNotification());
        final Notification finalNotification = notification;
        Map<Integer, Account> accountMap = accountRepository.findAllById(receiverIds).stream().collect(Collectors.toMap(Account::getIdAccount, a -> a));
        List<NotificationRecipient> recipients = receiverIds.stream().filter(accountMap::containsKey).map(receiverId -> {
            NotificationRecipient recipient = new NotificationRecipient();
            recipient.setNotification(finalNotification);
            recipient.setAccount(accountMap.get(receiverId));
            recipient.setIsRead(false);
            return recipient;
        }).collect(Collectors.toList());
        recipients = recipientRepository.saveAll(recipients);
        log.info("✅ Đã tạo {} recipients", recipients.size());
        for (NotificationRecipient recipient : recipients) {
            Account receiver = accountMap.get(recipient.getAccount().getIdAccount());
            sendWebSocketNotificationAsync(receiver, finalNotification, recipient);
        }
        log.info("🚀 Đã gửi async {} WebSocket notifications", recipients.size());
    }

    // ==================== RESOLVE RECEIVERS ====================
    private List<Integer> resolveReceivers(NotificationRequest request) {
        if (request.getReceiverAccountId() != null) {
            return List.of(request.getReceiverAccountId());
        }
        if (request.getReceiverAccountIds() != null && !request.getReceiverAccountIds().isEmpty()) {
            return request.getReceiverAccountIds();
        }
        if (request.getReceiverRole() != null && !request.getReceiverRole().trim().isEmpty()) {
            switch (request.getReceiverRole().toUpperCase()) {
                case "ALL_STUDENTS": return accountRepository.findAllStudentAccountIds();
                case "ALL_TEACHERS": return accountRepository.findAllTeacherAccountIds();
                case "ALL_USERS": return accountRepository.findAllActiveAccountIds();
                default:
                    log.warn("⚠️ ReceiverRole không hợp lệ: {}", request.getReceiverRole());
                    return List.of();
            }
        }
        if (request.getCourseId() != null) {
            return accountRepository.findStudentIdsByCourseId(request.getCourseId());
        }
        return List.of();
    }

    // ==================== SEND WEBSOCKET ====================
    @Async("notificationExecutor")
    public void sendWebSocketNotificationAsync(Account receiver, Notification notification, NotificationRecipient recipient) {
        try {
            String json = mapper.toJson(notification, recipient);
            if (json == null) return;
            messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/notifications", json);
            String receiverIdStr = String.valueOf(receiver.getIdAccount());
            if (!receiverIdStr.equals(receiver.getUsername())) {
                messagingTemplate.convertAndSendToUser(receiverIdStr, "/queue/notifications", json);
            }
            log.info("📨 Đã gửi đến user {}", receiver.getUsername());
        } catch (Exception e) {
            log.warn("⚠️ User {} offline, notification đã lưu DB", receiver.getUsername());
        }
    }

    // ==================== GET NOTIFICATIONS ====================
    @Override
    public Page<NotificationResponse> getMyNotifications(Integer accountId, Pageable pageable) {
        return recipientRepository.findByAccountId(accountId, pageable).map(recipient -> mapper.toResponse(recipient.getNotification(), recipient));
    }

    @Override
    public long getUnreadCount(Integer accountId) {
        Long count = recipientRepository.countUnreadByAccountId(accountId);
        return count != null ? count : 0L;
    }

    // ==================== MARK AS READ ====================
    @Override @Transactional
    public void markAsRead(Integer notificationId, Integer accountId) {
        validator.validateForMarkAsRead(notificationId, accountId);
        NotificationRecipient recipient = recipientRepository.findByNotificationIdAndAccountId(notificationId, accountId);
        if (recipient == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Notification không tồn tại hoặc không thuộc về bạn");
        }
        recipient.setIsRead(true);
        recipient.setReadAt(LocalDateTime.now());
        recipientRepository.save(recipient);
    }

    @Override @Transactional
    public void markAllAsRead(Integer accountId) {
        List<NotificationRecipient> unreadRecipients = recipientRepository.findUnreadByAccountId(accountId);
        if (unreadRecipients.isEmpty()) return;
        LocalDateTime now = LocalDateTime.now();
        unreadRecipients.forEach(recipient -> {
            recipient.setIsRead(true);
            recipient.setReadAt(now);
        });
        recipientRepository.saveAll(unreadRecipients);
    }

    // ==================== ✅ DELETE ====================

    /** Xóa 1 thông báo của user hiện tại. CHỈ xóa recipient của user đó — KHÔNG ảnh hưởng recipients của user khác. */
    @Override @Transactional
    public void deleteNotification(Integer notificationId, Integer accountId) {
        int deleted = recipientRepository.deleteByNotificationIdAndAccountId(notificationId, accountId);
        if (deleted == 0) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Thông báo không tồn tại hoặc không thuộc về bạn");
        }
        log.info("🗑️ Đã xóa notification {} của account {}", notificationId, accountId);
    }

    /** Xóa TẤT CẢ thông báo của user hiện tại. Trả về số record đã xóa để log. */
    @Override @Transactional
    public void deleteAllNotifications(Integer accountId) {
        int deleted = recipientRepository.deleteAllByAccountId(accountId);
        log.info("🗑️ Đã xóa {} thông báo của account {}", deleted, accountId);
    }

    // ==================== HELPER ====================
    private String convertExtraDataToJson(Map<String, Object> extraData) {
        if (extraData == null || extraData.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(extraData);
        } catch (Exception e) {
            log.warn("⚠️ Không thể convert extraData: {}", e.getMessage());
            return null;
        }
    }
}