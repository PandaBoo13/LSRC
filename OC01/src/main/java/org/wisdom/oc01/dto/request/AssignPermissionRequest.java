package org.wisdom.oc01.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionRequest {

    private Integer permissionId;  // Dùng cho gán 1 quyền - KHÔNG bắt buộc

    private List<Integer> permissionIds;  // Dùng cho gán nhiều quyền - KHÔNG bắt buộc
}