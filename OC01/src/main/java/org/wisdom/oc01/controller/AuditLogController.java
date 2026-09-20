package org.wisdom.oc01.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.AuditLogSearchRequest;
import org.wisdom.oc01.dto.response.AuditLogResponse;
import org.wisdom.oc01.service.AuditLogService;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới xem được audit log
public class AuditLogController {

    private final AuditLogService auditLogService;

    // Tìm kiếm & filter
    @GetMapping
    public ResponseEntity<RequestResponse> search(@ModelAttribute AuditLogSearchRequest request) {
        Page<AuditLogResponse> logs = auditLogService.search(request);
        return ResponseEntity.ok(new RequestResponse(logs, "Lấy danh sách audit log thành công"));
    }

    // Xem log theo entity
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<RequestResponse> getByEntity(
            @PathVariable String entityType,
            @PathVariable Integer entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLogResponse> logs = auditLogService.getByEntity(entityType, entityId, page, size);
        return ResponseEntity.ok(new RequestResponse(logs, "Lấy audit log theo entity thành công"));
    }

    // Xem log theo người dùng
    @GetMapping("/actor/{actorId}")
    public ResponseEntity<RequestResponse> getByActor(
            @PathVariable Integer actorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLogResponse> logs = auditLogService.getByActor(actorId, page, size);
        return ResponseEntity.ok(new RequestResponse(logs, "Lấy audit log theo người dùng thành công"));
    }

    // Dọn dẹp log cũ (Admin only)
    @DeleteMapping("/clean")
    public ResponseEntity<RequestResponse> cleanOldLogs(@RequestParam(defaultValue = "90") int daysOld) {
        auditLogService.cleanOldLogs(daysOld);
        return ResponseEntity.ok(new RequestResponse("Đã xóa log cũ hơn " + daysOld + " ngày"));
    }
}