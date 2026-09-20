// ============================================================
// NotificationValidator.java - BỎ notificationType
// ============================================================
package org.wisdom.oc01.generic.validator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.exception.ErrorHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationValidator {

    /**
     * Validate request gửi notification.
     * Chỉ cần title + ít nhất 1 người nhận.
     */
    public void validateForSend(NotificationRequest request) {


        // Validate title
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề thông báo không được để trống");
        }

        if (request.getTitle().length() > 255) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề không được vượt quá 255 ký tự");
        }

        // Validate content
        if (request.getContent() != null && request.getContent().length() > 5000) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Nội dung không được vượt quá 5000 ký tự");
        }

        // ✅ Validate: Phải có ít nhất 1 cách xác định người nhận
        boolean hasReceiver = request.getReceiverAccountId() != null
                || (request.getReceiverAccountIds() != null && !request.getReceiverAccountIds().isEmpty())
                || (request.getReceiverRole() != null && !request.getReceiverRole().trim().isEmpty())
                || request.getCourseId() != null;

        if (!hasReceiver) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Phải xác định ít nhất 1 người nhận");
        }
    }

    /**
     * Validate đánh dấu đã đọc.
     */
    public void validateForMarkAsRead(Integer notificationId, Integer accountId) {
        if (notificationId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Notification ID không được để trống");
        }
        if (accountId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Account ID không được để trống");
        }
    }
}