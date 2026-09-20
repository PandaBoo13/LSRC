package org.wisdom.oc01.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.request.UpdateProfileRequest;
import org.wisdom.oc01.dto.response.*;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.generic.IService;
import java.util.List;

public interface AccountService extends IService<Account, Integer>, UserDetailsService {
    // Basic
    Account findByUsername(String username);

    // Role management
    void assignRoleToUser(Integer accountId, Integer roleId);
    void removeRoleFromUser(Integer accountId);
    List<RoleResponse> getUserRoles(Integer accountId);
    List<UserInfoResponse> getUsersByRole(Integer roleId);

    // Permission management
    UserPermissionsResponse getUserPermissions(Integer accountId);
    List<PermissionResponse> getAccountPermissions(Integer accountId);
    List<AccountPermissionResponse> getAccountPermissionsWithStatus(Integer accountId);
    void assignPermissionToAccount(Integer accountId, Integer permissionId);
    void removePermissionFromAccount(Integer accountId, Integer permissionId);
    void deactivatePermissionForAccount(Integer accountId, Integer permissionId);
    void activatePermissionForAccount(Integer accountId, Integer permissionId);
    void assignPermissionsToAccount(Integer accountId, List<Integer> permissionIds);
    void removeAllPermissionsFromAccount(Integer accountId);

    // Check permissions
    boolean hasPermission(Integer accountId, String permissionName);
    boolean hasPermissionOnResource(Integer accountId, String resource, String action);

    // User info
    List<UserInfoResponse> getAllUsers();
    List<UserInfoResponse> getAllTeachers();
}