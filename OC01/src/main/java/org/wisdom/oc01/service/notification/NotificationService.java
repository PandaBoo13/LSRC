// ============================================================
// NotificationService.java - ĐƠN GIẢN HÓA
// ============================================================
package org.wisdom.oc01.service.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.dto.response.NotificationResponse;

public interface NotificationService {

    /**
     * Gửi thông báo.
     * Xác định người nhận dựa trên request (1 user, nhiều users, role, course).
     */
    void sendNotification(NotificationRequest request);

    /**
     * Lấy danh sách thông báo của user.
     */
    Page<NotificationResponse> getMyNotifications(Integer accountId, Pageable pageable);

    /**
     * Lấy số lượng thông báo chưa đọc.
     */
    long getUnreadCount(Integer accountId);

    /**
     * Đánh dấu 1 thông báo đã đọc.
     */
    void markAsRead(Integer notificationId, Integer accountId);

    /**
     * Đánh dấu tất cả thông báo đã đọc.
     */
    void markAllAsRead(Integer accountId);

    // ==================== ✅ NEW: DELETE ====================

    /**
     * Xóa 1 thông báo của user.
     * CHỈ xóa recipient của user đó — không ảnh hưởng recipients của user khác.
     *
     * @param notificationId ID thông báo cần xóa
     * @param accountId ID user đang request (để kiểm tra quyền)
     */
    void deleteNotification(Integer notificationId, Integer accountId);

    /**
     * Xóa TẤT CẢ thông báo của user hiện tại.
     *
     * @param accountId ID user đang request
     */
    void deleteAllNotifications(Integer accountId);
}