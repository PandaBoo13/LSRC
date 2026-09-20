package org.wisdom.oc01.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.wisdom.oc01.dto.request.AuditLogSearchRequest;
import org.wisdom.oc01.dto.response.AuditLogResponse;
import org.wisdom.oc01.entity.AuditLog;
import org.wisdom.oc01.repository.AuditLogRepository;
import org.wisdom.oc01.service.AuditLogService;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Ghi audit log đầy đủ với old/new value và thông tin actor */
    @Override @Transactional
    public void log(String entityType, Integer entityId, String action, String summary, String oldValue, String newValue, Integer actorId, String actorName, String actorRole, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setAction(action);
        auditLog.setSummary(summary);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setActorId(actorId);
        auditLog.setActorName(actorName);
        auditLog.setActorRole(actorRole);
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }

    /** Ghi audit log rút gọn (không có old/new value, ip) */
    @Override @Transactional
    public void logSimple(String entityType, Integer entityId, String action, String summary, Integer actorId, String actorName, String actorRole) {
        log(entityType, entityId, action, summary, null, null, actorId, actorName, actorRole, null);
    }

    /** Tìm kiếm audit log theo nhiều tiêu chí, build Specification động */
    @Override
    public Page<AuditLogResponse> search(AuditLogSearchRequest request) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(request.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, request.getSortBy() != null ? request.getSortBy() : "createdAt");
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        Specification<AuditLog> spec = Specification.where(null);
        if (request.getEntityType() != null && !request.getEntityType().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityType"), request.getEntityType()));
        }
        if (request.getEntityId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityId"), request.getEntityId()));
        }
        if (request.getAction() != null && !request.getAction().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("action"), request.getAction()));
        }
        if (request.getActorId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actorId"), request.getActorId()));
        }
        if (request.getActorRole() != null && !request.getActorRole().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actorRole"), request.getActorRole()));
        }
        if (request.getStartDate() != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), request.getEndDate()));
        }
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("summary")), "%" + request.getKeyword().toLowerCase() + "%"));
        }
        return auditLogRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    /** Lấy audit log theo entity, phân trang, sắp xếp mới nhất trước */
    @Override
    public Page<AuditLogResponse> getByEntity(String entityType, Integer entityId, int page, int size) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, PageRequest.of(page, size)).map(this::mapToResponse);
    }

    /** Lấy audit log theo actor, phân trang, sắp xếp mới nhất trước */
    @Override
    public Page<AuditLogResponse> getByActor(Integer actorId, int page, int size) {
        return auditLogRepository.findByActorIdOrderByCreatedAtDesc(actorId, PageRequest.of(page, size)).map(this::mapToResponse);
    }

    /** Xóa các audit log cũ hơn số ngày chỉ định */
    @Override @Transactional
    public void cleanOldLogs(int daysOld) {
        auditLogRepository.deleteOldLogs(LocalDateTime.now().minusDays(daysOld));
    }

    // ==================== MAPPER ====================

    /** Map AuditLog entity → AuditLogResponse */
    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getIdAudit())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .action(log.getAction())
                .summary(log.getSummary())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .actorId(log.getActorId())
                .actorName(log.getActorName())
                .actorRole(log.getActorRole())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}