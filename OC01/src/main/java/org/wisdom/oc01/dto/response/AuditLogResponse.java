package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {
    private Long id;
    private String entityType;
    private Integer entityId;
    private String action;
    private String summary;
    private String oldValue;
    private String newValue;
    private Integer actorId;
    private String actorName;
    private String actorRole;
    private String ipAddress;
    private LocalDateTime createdAt;
}