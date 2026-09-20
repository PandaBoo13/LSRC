// src/main/java/org/wisdom/oc01/repository/notification/NotificationRecipientRepository.java
package org.wisdom.oc01.repository.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.notification.NotificationRecipient;

import java.util.List;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, Integer> {

    // ============ GET ============

    @Query("SELECT r FROM NotificationRecipient r " +
            "WHERE r.account.idAccount = :accountId AND r.notification.deletedAt IS NULL " +
            "ORDER BY r.notification.createdAt DESC")
    Page<NotificationRecipient> findByAccountId(@Param("accountId") Integer accountId, Pageable pageable);

    @Query("SELECT r FROM NotificationRecipient r " +
            "WHERE r.account.idAccount = :accountId AND r.isRead = false AND r.notification.deletedAt IS NULL " +
            "ORDER BY r.notification.createdAt DESC")
    List<NotificationRecipient> findUnreadByAccountId(@Param("accountId") Integer accountId);

    @Query("SELECT COUNT(r) FROM NotificationRecipient r " +
            "WHERE r.account.idAccount = :accountId AND r.isRead = false AND r.notification.deletedAt IS NULL")
    Long countUnreadByAccountId(@Param("accountId") Integer accountId);

    @Query("SELECT r FROM NotificationRecipient r " +
            "WHERE r.notification.idNotification = :notificationId")
    List<NotificationRecipient> findByNotificationId(@Param("notificationId") Integer notificationId);

    @Query("SELECT r FROM NotificationRecipient r " +
            "WHERE r.notification.idNotification = :notificationId AND r.account.idAccount = :accountId")
    NotificationRecipient findByNotificationIdAndAccountId(
            @Param("notificationId") Integer notificationId,
            @Param("accountId") Integer accountId);

    // ============ ✅ DELETE ============

    /**
     * Xóa 1 recipient (user chỉ xóa thông báo của mình, không ảnh hưởng user khác)
     * Trả về số record đã xóa để check có tồn tại hay không.
     */
    @Modifying
    @Query("DELETE FROM NotificationRecipient r " +
            "WHERE r.notification.idNotification = :notificationId " +
            "AND r.account.idAccount = :accountId")
    int deleteByNotificationIdAndAccountId(
            @Param("notificationId") Integer notificationId,
            @Param("accountId") Integer accountId);

    /**
     * Xóa TẤT CẢ recipient của 1 user.
     * Trả về số record đã xóa.
     */
    @Modifying
    @Query("DELETE FROM NotificationRecipient r " +
            "WHERE r.account.idAccount = :accountId")
    int deleteAllByAccountId(@Param("accountId") Integer accountId);
}