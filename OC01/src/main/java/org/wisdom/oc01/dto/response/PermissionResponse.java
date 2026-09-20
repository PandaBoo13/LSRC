package org.wisdom.oc01.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {
    private Integer idPermission;
    private String permissionName;
    private String resource;
    private String action;
    private String description;
    private Boolean isDefault;
}