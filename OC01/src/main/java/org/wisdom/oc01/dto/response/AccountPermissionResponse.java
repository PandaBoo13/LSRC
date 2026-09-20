// src/main/java/org/wisdom/oc01/dto/response/AccountPermissionResponse.java
package org.wisdom.oc01.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountPermissionResponse {
    private Integer idAccountPermission;
    private Integer idPermission;
    private String permissionName;
    private String resource;
    private String action;
    private String description;
    private Boolean isDefault;
    private Boolean isActive;  // Trạng thái active của permission trên account này
    private String createdAt;
}