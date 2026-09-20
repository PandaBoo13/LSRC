package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.request.PermissionRequest;
import org.wisdom.oc01.dto.response.PermissionResponse;
import org.wisdom.oc01.generic.IService;
import org.wisdom.oc01.entity.Permission;

import java.util.List;

public interface PermissionService extends IService<Permission, Integer> {
    PermissionResponse createPermission(PermissionRequest request);
    PermissionResponse updatePermission(Integer id, PermissionRequest request);
    List<PermissionResponse> getAllPermissions();
    PermissionResponse getPermissionById(Integer id);
    List<PermissionResponse> getDefaultPermissions();

}