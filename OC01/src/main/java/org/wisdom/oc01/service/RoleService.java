package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.request.RoleRequest;
import org.wisdom.oc01.dto.response.RoleResponse;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.generic.IService;

import java.util.List;

public interface RoleService extends IService<Role, Integer> {

    // CRUD
    RoleResponse createRole(RoleRequest request);
    RoleResponse updateRole(Integer id, RoleRequest request);
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(Integer id);

    // Custom methods
    List<RoleResponse> getRolesByAccountId(Integer accountId);
}