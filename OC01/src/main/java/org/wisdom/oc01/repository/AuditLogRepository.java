package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.wisdom.oc01.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    // Tìm theo entity
    Page<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Integer entityId, Pageable pageable);

    // Tìm theo người thực hiện
    Page<AuditLog> findByActorIdOrderByCreatedAtDesc(Integer actorId, Pageable pageable);

    // Tìm theo loại hành động
    Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    // Tìm theo thời gian
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :start AND :end ORDER BY a.createdAt DESC")
    Page<AuditLog> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    // Thống kê
    @Query("SELECT a.action, COUNT(a) FROM AuditLog a GROUP BY a.action")
    List<Object[]> countByAction();

    // Xóa log cũ (dọn dẹp)
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :before")
    void deleteOldLogs(@Param("before") LocalDateTime before);
}