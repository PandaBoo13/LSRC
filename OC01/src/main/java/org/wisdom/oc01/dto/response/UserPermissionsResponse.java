package org.wisdom.oc01.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionsResponse {
    private Integer accountId;
    private String username;
    private List<String> roles;
    private List<String> permissions;

    // THÊM FIELD NÀY - Để kiểm tra resource + action
    private Map<String, List<String>> permissionsByResource;
    // Ví dụ: {"PRODUCT": ["VIEW", "CREATE"], "ORDER": ["VIEW", "DELETE"]}
}