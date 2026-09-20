// src/main/java/org/wisdom/oc01/controller/notification/NotificationController.java
package org.wisdom.oc01.controller.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.dto.response.NotificationResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.service.notification.NotificationService;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    // KHÔNG còn field generalService — dùng SecurityUtils static.

    // ============================================================
    // 1. LẤY DANH SÁCH THÔNG BÁO CỦA TÔI (PHÂN TRANG)
    // ============================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Account currentAccount = SecurityUtils.requireCurrentAccount();
        Pageable pageable = PageRequest.of(page, size);

        Page<NotificationResponse> notifications = notificationService
                .getMyNotifications(currentAccount.getIdAccount(), pageable);

        return ResponseEntity.ok(
                new RequestResponse(notifications, "Lấy danh sách thông báo thành công"));
    }

    // ============================================================
    // 2. ĐẾM SỐ THÔNG BÁO CHƯA ĐỌC
    // ============================================================
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getUnreadCount() {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        long unreadCount = notificationService.getUnreadCount(currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(unreadCount, "Lấy số thông báo chưa đọc thành công"));
    }

    // ============================================================
    // 3. ĐÁNH DẤU 1 THÔNG BÁO ĐÃ ĐỌC
    // ============================================================
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> markAsRead(@PathVariable Integer notificationId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        notificationService.markAsRead(notificationId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Đánh dấu đã đọc thành công"));
    }

    // ============================================================
    // 4. ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
    // ============================================================
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> markAllAsRead() {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        notificationService.markAllAsRead(currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Đánh dấu tất cả đã đọc thành công"));
    }

    // ============================================================
    // 5. ADMIN GỬI THÔNG BÁO THỦ CÔNG
    // ============================================================
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RequestResponse> sendNotification(
            @RequestBody NotificationRequest request) {

        Account currentAccount = SecurityUtils.requireCurrentAccount();
        request.setSenderAccountId(currentAccount.getIdAccount());

        notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse("Gửi thông báo thành công"));
    }

    // ============================================================
    // 6. XÓA 1 THÔNG BÁO CỦA USER
    // ============================================================
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> deleteNotification(
            @PathVariable Integer notificationId) {

        Account currentAccount = SecurityUtils.requireCurrentAccount();

        notificationService.deleteNotification(notificationId, currentAccount.getIdAccount());

        log.info("🗑️ Account {} đã xóa notification {}",
                currentAccount.getIdAccount(), notificationId);

        return ResponseEntity.ok(
                new RequestResponse("Xóa thông báo thành công"));
    }

    // ============================================================
    // 7. XÓA TẤT CẢ THÔNG BÁO CỦA USER
    // ============================================================
    @DeleteMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> deleteAllNotifications() {
        Account currentAccount = SecurityUtils.requireCurrentAccount();

        notificationService.deleteAllNotifications(currentAccount.getIdAccount());

        log.info("🗑️ Account {} đã xóa TẤT CẢ thông báo",
                currentAccount.getIdAccount());

        return ResponseEntity.ok(
                new RequestResponse("Xóa tất cả thông báo thành công"));
    }
}