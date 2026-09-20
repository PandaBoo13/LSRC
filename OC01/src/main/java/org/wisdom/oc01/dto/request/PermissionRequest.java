package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionRequest {

    @NotBlank(message = "Permission name is required")
    @Size(max = 100, message = "Permission name must not exceed 100 characters")
    private String permissionName;

    @NotBlank(message = "Resource is required")
    @Size(max = 50, message = "Resource must not exceed 50 characters")
    private String resource;

    @NotBlank(message = "Action is required")
    @Size(max = 20, message = "Action must not exceed 20 characters")
    private String action;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private Boolean isDefault;
}