// src/test/java/org/wisdom/oc01/RBACIntegrationTest.java
package org.wisdom.oc01;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.wisdom.oc01.dto.request.PermissionRequest;
import org.wisdom.oc01.dto.request.RoleRequest;
import org.wisdom.oc01.dto.response.*;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.service.AccountService;
import org.wisdom.oc01.service.PermissionService;
import org.wisdom.oc01.service.RoleService;

import jakarta.transaction.Transactional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class RBACIntegrationTest {

    @Autowired private RoleService roleService;
    @Autowired private PermissionService permissionService;
    @Autowired private AccountService accountService;
    @Autowired private AccountRepository accountRepository;

    private static final String TEST_ROLE = "TEST_ROLE";
    private static final String TEST_ROLE_V2 = "TEST_ROLE_V2";
    private static final String TEST_PERM = "TEST_PERM";
    private static final String TEST_PERM_V2 = "TEST_PERM_V2";

    // Helper methods - query thay vì static variable
    private Integer getRoleId() {
        return roleService.getAllRoles().stream()
                .filter(r -> r.getRoleName().equals(TEST_ROLE_V2) || r.getRoleName().equals(TEST_ROLE))
                .findFirst().orElseThrow().getIdRole();
    }

    private Integer getPermissionId() {
        return permissionService.getAllPermissions().stream()
                .filter(p -> p.getPermissionName().equals(TEST_PERM_V2) || p.getPermissionName().equals(TEST_PERM))
                .findFirst().orElseThrow().getIdPermission();
    }

    private Integer getAccountId() {
        return accountRepository.findAll().stream().findFirst().orElseThrow().getIdAccount();
    }

    // ==================== ROLE ====================

    @Test @Order(1)
    void createRole_Success() {
        RoleRequest req = new RoleRequest();
        req.setRoleName(TEST_ROLE);
        RoleResponse res = roleService.createRole(req);
        assertNotNull(res.getIdRole());
    }

    @Test @Order(2)
    void createRole_Duplicate_ShouldThrow() {
        RoleRequest req = new RoleRequest();
        req.setRoleName(TEST_ROLE);
        ErrorHandler err = assertThrows(ErrorHandler.class, () -> roleService.createRole(req));
        assertEquals(HttpStatus.BAD_REQUEST, err.getStatus());
    }

    @Test @Order(3)
    void getAllRoles_Success() {
        assertTrue(roleService.getAllRoles().size() > 0);
    }

    @Test @Order(4)
    void updateRole_Success() {
        Integer id = getRoleId();
        RoleRequest req = new RoleRequest();
        req.setRoleName(TEST_ROLE_V2);
        RoleResponse res = roleService.updateRole(id, req);
        assertEquals(TEST_ROLE_V2, res.getRoleName());
    }

    // ==================== PERMISSION ====================

    @Test @Order(5)
    void createPermission_Success() {
        PermissionRequest req = new PermissionRequest();
        req.setPermissionName(TEST_PERM);
        req.setResource("COURSE");
        req.setAction("CREATE");
        PermissionResponse res = permissionService.createPermission(req);
        assertNotNull(res.getIdPermission());
    }

    @Test @Order(6)
    void createPermission_Duplicate_ShouldThrow() {
        PermissionRequest req = new PermissionRequest();
        req.setPermissionName(TEST_PERM);
        req.setResource("COURSE");
        req.setAction("CREATE");
        ErrorHandler err = assertThrows(ErrorHandler.class, () -> permissionService.createPermission(req));
        assertEquals(HttpStatus.BAD_REQUEST, err.getStatus());
    }

    @Test @Order(7)
    void updatePermission_Success() {
        Integer id = getPermissionId();
        PermissionRequest req = new PermissionRequest();
        req.setPermissionName(TEST_PERM_V2);
        req.setResource("COURSE");
        req.setAction("CREATE");
        PermissionResponse res = permissionService.updatePermission(id, req);
        assertEquals(TEST_PERM_V2, res.getPermissionName());
    }

    @Test @Order(8)
    void getPermissionById_Success() {
        Integer id = getPermissionId();
        PermissionResponse res = permissionService.getPermissionById(id);
        assertEquals(TEST_PERM_V2, res.getPermissionName());
    }

    // ==================== ASSIGN ROLE ====================

    @Test @Order(9)
    void assignRoleToAccount_Success() {
        accountService.assignRoleToUser(getAccountId(), getRoleId());
        List<RoleResponse> roles = accountService.getUserRoles(getAccountId());
        assertEquals(1, roles.size());
    }

    @Test @Order(10)
    void getUserPermissions_AfterRole_Success() {
        assertNotNull(accountService.getUserPermissions(getAccountId()));
    }

    // ==================== ASSIGN PERMISSION ====================

    @Test @Order(11)
    void assignPermissionToAccount_Success() {
        accountService.assignPermissionToAccount(getAccountId(), getPermissionId());
        assertTrue(accountService.hasPermission(getAccountId(), TEST_PERM_V2));
    }

    @Test @Order(12)
    void assignPermission_Duplicate_ShouldThrow() {
        ErrorHandler err = assertThrows(ErrorHandler.class,
                () -> accountService.assignPermissionToAccount(getAccountId(), getPermissionId()));
        assertEquals(HttpStatus.BAD_REQUEST, err.getStatus());
    }

    @Test @Order(13)
    void hasPermissionOnResource_True() {
        assertTrue(accountService.hasPermissionOnResource(getAccountId(), "COURSE", "CREATE"));
    }

    @Test @Order(14)
    void hasPermissionOnResource_False() {
        assertFalse(accountService.hasPermissionOnResource(getAccountId(), "COURSE", "DELETE"));
    }

    @Test @Order(15)
    void getAccountPermissionsWithStatus_Success() {
        assertTrue(accountService.getAccountPermissionsWithStatus(getAccountId()).size() > 0);
    }

    // ==================== DEACTIVATE ====================

    @Test @Order(16)
    void deactivatePermission_Success() {
        accountService.deactivatePermissionForAccount(getAccountId(), getPermissionId());
        assertFalse(accountService.hasPermission(getAccountId(), TEST_PERM_V2));
    }

    @Test @Order(17)
    void deactivatePermission_AlreadyInactive_ShouldThrow() {
        ErrorHandler err = assertThrows(ErrorHandler.class,
                () -> accountService.deactivatePermissionForAccount(getAccountId(), getPermissionId()));
        assertEquals(HttpStatus.NOT_FOUND, err.getStatus());
    }

    // ==================== ACTIVATE ====================

    @Test @Order(18)
    void activatePermission_Success() {
        accountService.activatePermissionForAccount(getAccountId(), getPermissionId());
        assertTrue(accountService.hasPermission(getAccountId(), TEST_PERM_V2));
    }

    @Test @Order(19)
    void activatePermission_AlreadyActive_ShouldThrow() {
        ErrorHandler err = assertThrows(ErrorHandler.class,
                () -> accountService.activatePermissionForAccount(getAccountId(), getPermissionId()));
        assertEquals(HttpStatus.BAD_REQUEST, err.getStatus());
    }

    // ==================== REMOVE PERMISSION ====================

    @Test @Order(20)
    void removePermission_Success() {
        accountService.removePermissionFromAccount(getAccountId(), getPermissionId());
        assertFalse(accountService.hasPermission(getAccountId(), TEST_PERM_V2));
    }

    @Test @Order(21)
    void removePermission_NotFound_ShouldThrow() {
        ErrorHandler err = assertThrows(ErrorHandler.class,
                () -> accountService.removePermissionFromAccount(getAccountId(), getPermissionId()));
        assertEquals(HttpStatus.NOT_FOUND, err.getStatus());
    }

    // ==================== BATCH ====================

    @Test @Order(22)
    void batchAssignPermissions_Success() {
        accountService.assignPermissionsToAccount(getAccountId(), List.of(getPermissionId()));
        assertTrue(accountService.hasPermission(getAccountId(), TEST_PERM_V2));
    }

    // ==================== REMOVE ROLE ====================

    @Test @Order(23)
    void removeRole_Success() {
        accountService.removeRoleFromUser(getAccountId());
        assertEquals(0, accountService.getUserRoles(getAccountId()).size());
    }

    // ==================== CLEANUP ====================

    @Test @Order(24)
    void deletePermission_Success() {
        accountService.removeAllPermissionsFromAccount(getAccountId());
        Integer permId = getPermissionId();
        permissionService.delete(permId);
        ErrorHandler err = assertThrows(ErrorHandler.class,
                () -> permissionService.getPermissionById(permId));
        assertEquals(HttpStatus.NOT_FOUND, err.getStatus());
    }

    @Test @Order(25)
    void deleteRole_Success() {
        Integer roleId = getRoleId();
        roleService.delete(roleId);
        ErrorHandler err = assertThrows(ErrorHandler.class,
                () -> roleService.getRoleById(roleId));
        assertEquals(HttpStatus.NOT_FOUND, err.getStatus());
    }
}