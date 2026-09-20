package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.wisdom.oc01.dto.request.AuditLogSearchRequest;
import org.wisdom.oc01.dto.response.AuditLogResponse;

public interface AuditLogService {
    // Ghi log đầy đủ
    void log(String entityType, Integer entityId, String action, String summary, String oldValue, String newValue, Integer actorId, String actorName, String actorRole, String ipAddress);

    // Ghi log nhanh (không cần old/new value)
    void logSimple(String entityType, Integer entityId, String action, String summary, Integer actorId, String actorName, String actorRole);

    // Query
    Page<AuditLogResponse> search(AuditLogSearchRequest request);

    // Lấy log theo entity
    Page<AuditLogResponse> getByEntity(String entityType, Integer entityId, int page, int size);

    // Lấy log theo người dùng
    Page<AuditLogResponse> getByActor(Integer actorId, int page, int size);

    // Dọn dẹp log cũ
    void cleanOldLogs(int daysOld);
}