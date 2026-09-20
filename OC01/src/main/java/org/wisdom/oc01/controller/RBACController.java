package org.wisdom.oc01.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.config.PermissionManager;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.*;
import org.wisdom.oc01.dto.response.*;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.service.AccountService;
import org.wisdom.oc01.service.PermissionService;
import org.wisdom.oc01.service.RoleService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/rbac")
public class RBACController {

    private final RoleService roleService;
    private final PermissionService permissionService;
    private final AccountService accountService;
    private final PermissionManager permissionManager;

    public RBACController(RoleService roleService,
                          PermissionService permissionService,
                          AccountService accountService,
                          PermissionManager permissionManager) {
        this.roleService = roleService;
        this.permissionService = permissionService;
        this.accountService = accountService;
        this.permissionManager = permissionManager;
    }

    // ==================== ROLES ====================

    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(new RequestResponse(roles, "Roles retrieved successfully"));
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<?> getRoleById(@PathVariable Integer id) {
        RoleResponse role = roleService.getRoleById(id);
        return ResponseEntity.ok(new RequestResponse(role, "Role retrieved successfully"));
    }

    @PostMapping("/roles")
    public ResponseEntity<?> createRole(@Valid @RequestBody RoleRequest request) {
        RoleResponse response = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(response, "Role created successfully"));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Integer id,
                                        @Valid @RequestBody RoleRequest request) {
        RoleResponse response = roleService.updateRole(id, request);
        return ResponseEntity.ok(new RequestResponse(response, "Role updated successfully"));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Integer id) {
        roleService.delete(id);
        permissionManager.clearAllCache();
        return ResponseEntity.ok(new RequestResponse("Role deleted successfully"));
    }

    // ==================== PERMISSIONS ====================

    @GetMapping("/permissions")
    public ResponseEntity<?> getAllPermissions() {
        List<PermissionResponse> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(new RequestResponse(permissions, "Permissions retrieved successfully"));
    }

    @GetMapping("/permissions/default")
    public ResponseEntity<?> getDefaultPermissions() {
        List<PermissionResponse> permissions = permissionService.getDefaultPermissions();
        return ResponseEntity.ok(new RequestResponse(permissions, "Default permissions retrieved successfully"));
    }

    @GetMapping("/permissions/{id}")
    public ResponseEntity<?> getPermissionById(@PathVariable Integer id) {
        PermissionResponse permission = permissionService.getPermissionById(id);
        return ResponseEntity.ok(new RequestResponse(permission, "Permission retrieved successfully"));
    }

    @PostMapping("/permissions")
    public ResponseEntity<?> createPermission(@Valid @RequestBody PermissionRequest request) {
        PermissionResponse response = permissionService.createPermission(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(response, "Permission created successfully"));
    }

    @PutMapping("/permissions/{id}")
    public ResponseEntity<?> updatePermission(@PathVariable Integer id,
                                              @Valid @RequestBody PermissionRequest request) {
        PermissionResponse response = permissionService.updatePermission(id, request);
        permissionManager.clearAllCache();
        return ResponseEntity.ok(new RequestResponse(response, "Permission updated successfully"));
    }


    // ==================== ACCOUNT PERMISSIONS (QUẢN LÝ QUYỀN TRỰC TIẾP) ====================

    /**
     * Lấy tất cả quyền của account (bao gồm permission mặc định)
     */
    @GetMapping("/accounts/{accountId}/permissions")
    public ResponseEntity<?> getAccountPermissions(@PathVariable Integer accountId) {
        UserPermissionsResponse response = accountService.getUserPermissions(accountId);
        return ResponseEntity.ok(new RequestResponse(response, "Account permissions retrieved successfully"));
    }

//    /**
//     * Lấy danh sách quyền riêng của account (không bao gồm permission mặc định)
//     */
//    @GetMapping("/accounts/{accountId}/permissions/custom")
//    public ResponseEntity<?> getAccountCustomPermissions(@PathVariable Integer accountId) {
//        List<PermissionResponse> permissions = accountService.getAccountPermissions(accountId);
//        return ResponseEntity.ok(new RequestResponse(permissions, "Account custom permissions retrieved successfully"));
//    }
    /**
     * Lấy danh sách quyền riêng của account (bao gồm trạng thái active)
     * ✅ SỬA: Dùng method mới getAccountPermissionsWithStatus
     */
    @GetMapping("/accounts/{accountId}/permissions/custom")
    public ResponseEntity<?> getAccountCustomPermissions(@PathVariable Integer accountId) {
        List<AccountPermissionResponse> permissions = accountService.getAccountPermissionsWithStatus(accountId);
        return ResponseEntity.ok(new RequestResponse(permissions, "Account custom permissions retrieved successfully"));
    }

    /**
     * Gán quyền cho account
     */
    @PostMapping("/accounts/{accountId}/permissions")
    public ResponseEntity<?> assignPermissionToAccount(
            @PathVariable Integer accountId,
            @Valid @RequestBody AssignPermissionRequest request) {
        accountService.assignPermissionToAccount(accountId, request.getPermissionId());
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Permission assigned to account successfully"));
    }

    /**
     * Gán nhiều quyền cho account cùng lúc
     */
    @PostMapping("/accounts/{accountId}/permissions/batch")
    public ResponseEntity<?> assignPermissionsToAccount(
            @PathVariable Integer accountId,
            @Valid @RequestBody AssignPermissionRequest request) {
        accountService.assignPermissionsToAccount(accountId, request.getPermissionIds());
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Permissions assigned to account successfully"));
    }

    /**
     * Xóa quyền của account (hard delete)
     */
    @DeleteMapping("/accounts/{accountId}/permissions/{permissionId}")
    public ResponseEntity<?> removePermissionFromAccount(
            @PathVariable Integer accountId,
            @PathVariable Integer permissionId) {
        accountService.removePermissionFromAccount(accountId, permissionId);
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Permission removed from account successfully"));
    }

    /**
     * Vô hiệu hóa quyền của account (soft delete)
     */
    @PatchMapping("/accounts/{accountId}/permissions/{permissionId}/deactivate")
    public ResponseEntity<?> deactivatePermissionForAccount(
            @PathVariable Integer accountId,
            @PathVariable Integer permissionId) {
        accountService.deactivatePermissionForAccount(accountId, permissionId);
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Permission deactivated for account successfully"));
    }

    /**
     * Kích hoạt lại quyền của account
     */
    @PatchMapping("/accounts/{accountId}/permissions/{permissionId}/activate")
    public ResponseEntity<?> activatePermissionForAccount(
            @PathVariable Integer accountId,
            @PathVariable Integer permissionId) {
        accountService.activatePermissionForAccount(accountId, permissionId);
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Permission activated for account successfully"));
    }

    /**
     * Xóa tất cả quyền của account
     */
    @DeleteMapping("/accounts/{accountId}/permissions")
    public ResponseEntity<?> removeAllPermissionsFromAccount(@PathVariable Integer accountId) {
        accountService.removeAllPermissionsFromAccount(accountId);
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("All permissions removed from account successfully"));
    }

    /**
     * Kiểm tra account có quyền cụ thể không
     */
    @GetMapping("/accounts/{accountId}/permissions/check")
    public ResponseEntity<?> checkPermission(
            @PathVariable Integer accountId,
            @RequestParam String permissionName) {
        boolean hasPermission = accountService.hasPermission(accountId, permissionName);
        return ResponseEntity.ok(new RequestResponse(hasPermission, "Permission check completed"));
    }

    /**
     * Kiểm tra account có quyền trên resource không
     */
    @GetMapping("/accounts/{accountId}/permissions/check-resource")
    public ResponseEntity<?> checkPermissionOnResource(
            @PathVariable Integer accountId,
            @RequestParam String resource,
            @RequestParam String action) {
        boolean hasPermission = accountService.hasPermissionOnResource(accountId, resource, action);
        return ResponseEntity.ok(new RequestResponse(hasPermission, "Permission check completed"));
    }

    // ==================== ACCOUNT ROLES ====================

    /**
     * Lấy role của account
     */
    @GetMapping("/accounts/{accountId}/roles")
    public ResponseEntity<?> getUserRoles(@PathVariable Integer accountId) {
        List<RoleResponse> roles = accountService.getUserRoles(accountId);
        return ResponseEntity.ok(new RequestResponse(roles, "User roles retrieved successfully"));
    }

    /**
     * Gán role cho account
     */
    @PutMapping("/accounts/{accountId}/role")
    public ResponseEntity<?> assignRoleToUser(
            @PathVariable Integer accountId,
            @Valid @RequestBody AssignRoleRequest request) {
        accountService.assignRoleToUser(accountId, request.getRoleId());
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Role assigned to user successfully"));
    }

    /**
     * Xóa role của account
     */
    @DeleteMapping("/accounts/{accountId}/role")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Integer accountId) {
        accountService.removeRoleFromUser(accountId);
        permissionManager.clearCache(accountId);
        return ResponseEntity.ok(new RequestResponse("Role removed from user successfully"));
    }

    /**
     * Lấy danh sách account theo role
     */
    @GetMapping("/roles/{roleId}/accounts")
    public ResponseEntity<?> getUsersByRole(@PathVariable Integer roleId) {
        List<UserInfoResponse> users = accountService.getUsersByRole(roleId);
        return ResponseEntity.ok(new RequestResponse(users, "Users by role retrieved successfully"));
    }

    // ==================== ACCOUNTS ====================

    @GetMapping("/accounts")
    public ResponseEntity<?> getAllAccounts() {
        List<UserInfoResponse> users = accountService.getAllUsers();
        return ResponseEntity.ok(new RequestResponse(users, "Accounts retrieved successfully"));
    }

    @GetMapping("/accounts/teachers")
    public ResponseEntity<?> getAllTeachers() {
        List<UserInfoResponse> teachers = accountService.getAllTeachers();
        return ResponseEntity.ok(new RequestResponse(teachers, "Teachers retrieved successfully"));
    }

    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<?> getAccountById(@PathVariable Integer accountId) {
        Account account = accountService.findOne(accountId);
        return ResponseEntity.ok(new RequestResponse(account, "Account retrieved successfully"));
    }


}