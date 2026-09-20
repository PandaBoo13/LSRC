package org.wisdom.oc01.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogSearchRequest {
    private String entityType;   // COURSE, LESSON, EXAM...
    private Integer entityId;    // ID đối tượng cụ thể
    private String action;       // CREATE, UPDATE, DELETE...
    private Integer actorId;     // Người thực hiện
    private String actorRole;    // ADMIN, TEACHER, STUDENT
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String keyword;      // Tìm trong summary

    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}