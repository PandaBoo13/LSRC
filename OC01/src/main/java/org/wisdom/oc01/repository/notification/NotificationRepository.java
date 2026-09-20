// src/main/java/org/wisdom/oc01/repository/NotificationRepository.java
package org.wisdom.oc01.repository.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.notification.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Bỏ method findByType vì không còn sử dụng notificationType
    // Hoặc nếu vẫn muốn giữ, comment lại hoặc xóa hẳn

    @Query("SELECT n FROM Notification n WHERE n.sender.idAccount = :senderId AND n.deletedAt IS NULL")
    List<Notification> findBySenderId(@Param("senderId") Integer senderId);

    @Query("SELECT n FROM Notification n WHERE n.deletedAt IS NULL AND n.createdAt >= :startDate")
    List<Notification> findRecentNotifications(@Param("startDate") java.time.LocalDateTime startDate);

    // Nếu cần lấy tất cả notifications chưa xóa
    @Query("SELECT n FROM Notification n WHERE n.deletedAt IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findAllActive();
}