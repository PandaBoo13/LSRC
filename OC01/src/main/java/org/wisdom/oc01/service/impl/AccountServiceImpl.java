package org.wisdom.oc01.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.request.UpdateProfileRequest;
import org.wisdom.oc01.dto.response.*;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.FileStorageService;
import org.wisdom.oc01.generic.ServiceImpl;
import org.wisdom.oc01.repository.AccountPermissionRepository;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.PermissionRepository;
import org.wisdom.oc01.repository.RoleRepository;
import org.wisdom.oc01.service.AccountService;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl extends ServiceImpl<Account, Integer, AccountRepository> implements AccountService {
    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private AccountPermissionRepository accountPermissionRepository;
    @Autowired private FileStorageService fileStorageService;

    public AccountServiceImpl(AccountRepository repository) {
        super(repository);
    }

    @Override
    public Account findByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }

    // ============ HÀM BUILDER DÙNG CHUNG ============

    /** Build UserInfoResponse từ Account và roleName */
    public UserInfoResponse buildUserInfoResponse(Account account, String roleName) {
        User user = account.getUser();
        return UserInfoResponse.builder()
                .idAccount(account.getIdAccount())
                .username(account.getUsername())
                .email(account.getEmail())
                .firstName(user != null ? user.getFirstName() : "")
                .lastName(user != null ? user.getLastName() : "")
                .role(roleName)
                .provider(account.getProvider())
                .phone(user != null ? user.getPhone() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .bio(user != null ? user.getBio() : null)
                .dateOfBirth(user != null ? user.getDateOfBirth() : null)
                .gender(user != null && user.getGender() != null ? user.getGender().name() : null)
                .address(user != null ? user.getAddress() : null)
                .updatedAt(user != null ? user.getUpdatedAt() : null)
                .build();
    }

    // ============ PHÂN QUYỀN CHO ACCOUNT ============

    /** Lấy tất cả quyền của account (từ account_permission + permission mặc định) */
    @Override @Transactional(readOnly = true)
    public UserPermissionsResponse getUserPermissions(Integer accountId) {
        Account account = findOne(accountId);
        Set<String> allRoles = new HashSet<>();
        Set<String> allPermissions = new HashSet<>();
        Map<String, List<String>> permissionsByResource = new HashMap<>();
        if (account.getRole() != null) {
            allRoles.add(account.getRole().getRoleName());
        }
        // JOIN FETCH account permissions đang active
        List<AccountPermission> accountPermissions = accountPermissionRepository.findByAccountIdAccountAndIsActiveTrueWithPermission(accountId);
        for (AccountPermission ap : accountPermissions) {
            Permission perm = ap.getPermission();
            allPermissions.add(perm.getPermissionName());
            permissionsByResource.computeIfAbsent(perm.getResource(), k -> new ArrayList<>()).add(perm.getAction());
        }
        // Lấy permissions mặc định
        List<Permission> defaultPermissions = permissionRepository.findByIsDefaultTrue();
        for (Permission perm : defaultPermissions) {
            if (!allPermissions.contains(perm.getPermissionName())) {
                allPermissions.add(perm.getPermissionName());
                permissionsByResource.computeIfAbsent(perm.getResource(), k -> new ArrayList<>()).add(perm.getAction());
            }
        }
        return UserPermissionsResponse.builder()
                .accountId(accountId)
                .username(account.getUsername())
                .roles(new ArrayList<>(allRoles))
                .permissions(new ArrayList<>(allPermissions))
                .permissionsByResource(permissionsByResource)
                .build();
    }

    /** Lấy tất cả quyền của account (cả permission mặc định) */
    @Override @Transactional(readOnly = true)
    public List<PermissionResponse> getAccountPermissions(Integer accountId) {
        List<Permission> permissions = permissionRepository.findAllByAccountIdWithDefault(accountId);
        return permissions.stream().map(perm -> PermissionResponse.builder()
                .idPermission(perm.getIdPermission())
                .permissionName(perm.getPermissionName())
                .resource(perm.getResource())
                .action(perm.getAction())
                .description(perm.getDescription())
                .isDefault(perm.getIsDefault())
                .build()).collect(Collectors.toList());
    }

    /** Gán quyền cho account */
    @Override @Transactional
    public void assignPermissionToAccount(Integer accountId, Integer permissionId) {
        Account account = findOne(accountId);
        Permission permission = permissionRepository.findById(permissionId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Permission not found"));
        if (accountPermissionRepository.existsByAccountIdAccountAndPermissionIdPermissionAndIsActiveTrue(accountId, permissionId)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Permission already assigned and active for this account");
        }
        Optional<AccountPermission> existing = accountPermissionRepository.findByAccountIdAccountAndPermissionIdPermission(accountId, permissionId);
        if (existing.isPresent()) {
            if (!existing.get().getIsActive()) {
                accountPermissionRepository.activatePermission(accountId, permissionId);
            }
            return;
        }
        AccountPermission accountPermission = new AccountPermission();
        accountPermission.setAccount(account);
        accountPermission.setPermission(permission);
        accountPermission.setIsActive(true);
        accountPermissionRepository.save(accountPermission);
    }

    /** Xóa quyền của account (hard delete) */
    @Override @Transactional
    public void removePermissionFromAccount(Integer accountId, Integer permissionId) {
        findOne(accountId);
        permissionRepository.findById(permissionId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Permission not found"));
        Optional<AccountPermission> accountPermission = accountPermissionRepository.findByAccountIdAccountAndPermissionIdPermission(accountId, permissionId);
        if (accountPermission.isEmpty()) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Permission not assigned to this account");
        }
        accountPermissionRepository.delete(accountPermission.get());
    }

    /** Vô hiệu hóa quyền của account (soft delete) */
    @Override @Transactional
    public void deactivatePermissionForAccount(Integer accountId, Integer permissionId) {
        if (!accountPermissionRepository.existsByAccountIdAccountAndPermissionIdPermissionAndIsActiveTrue(accountId, permissionId)) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Permission not assigned or already inactive for this account");
        }
        accountPermissionRepository.deactivatePermission(accountId, permissionId);
    }

    /** Kích hoạt lại quyền của account */
    @Override @Transactional
    public void activatePermissionForAccount(Integer accountId, Integer permissionId) {
        Optional<AccountPermission> accountPermission = accountPermissionRepository.findByAccountIdAccountAndPermissionIdPermission(accountId, permissionId);
        if (accountPermission.isEmpty()) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Permission not assigned to this account");
        }
        if (accountPermission.get().getIsActive()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Permission is already active");
        }
        accountPermissionRepository.activatePermission(accountId, permissionId);
    }

    /** Gán nhiều quyền cho account cùng lúc */
    @Override @Transactional
    public void assignPermissionsToAccount(Integer accountId, List<Integer> permissionIds) {
        Account account = findOne(accountId);
        for (Integer permissionId : permissionIds) {
            Permission permission = permissionRepository.findById(permissionId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Permission not found with id: " + permissionId));
            if (accountPermissionRepository.existsByAccountIdAccountAndPermissionIdPermissionAndIsActiveTrue(accountId, permissionId)) {
                continue;
            }
            Optional<AccountPermission> existing = accountPermissionRepository.findByAccountIdAccountAndPermissionIdPermission(accountId, permissionId);
            if (existing.isPresent() && !existing.get().getIsActive()) {
                accountPermissionRepository.activatePermission(accountId, permissionId);
                continue;
            }
            AccountPermission accountPermission = new AccountPermission();
            accountPermission.setAccount(account);
            accountPermission.setPermission(permission);
            accountPermission.setIsActive(true);
            accountPermissionRepository.save(accountPermission);
        }
    }

    /** Xóa tất cả quyền của account */
    @Override @Transactional
    public void removeAllPermissionsFromAccount(Integer accountId) {
        findOne(accountId);
        accountPermissionRepository.deleteByAccountIdAccount(accountId);
    }

    /** Kiểm tra account có quyền không (bao gồm cả permission mặc định) */
    @Override @Transactional(readOnly = true)
    public boolean hasPermission(Integer accountId, String permissionName) {
        List<AccountPermission> accountPermissions = accountPermissionRepository.findByAccountIdAccountAndIsActiveTrueWithPermission(accountId);
        for (AccountPermission ap : accountPermissions) {
            if (ap.getPermission().getPermissionName().equals(permissionName)) return true;
        }
        List<Permission> defaultPermissions = permissionRepository.findByIsDefaultTrue();
        for (Permission perm : defaultPermissions) {
            if (perm.getPermissionName().equals(permissionName)) return true;
        }
        return false;
    }

    /** Kiểm tra account có quyền trên resource không (bao gồm cả permission mặc định) */
    @Override @Transactional(readOnly = true)
    public boolean hasPermissionOnResource(Integer accountId, String resource, String action) {
        List<AccountPermission> accountPermissions = accountPermissionRepository.findByAccountIdAccountAndIsActiveTrueWithPermission(accountId);
        for (AccountPermission ap : accountPermissions) {
            Permission perm = ap.getPermission();
            if (perm.getResource().equals(resource) && perm.getAction().equals(action)) return true;
        }
        List<Permission> defaultPermissions = permissionRepository.findByIsDefaultTrue();
        for (Permission perm : defaultPermissions) {
            if (perm.getResource().equals(resource) && perm.getAction().equals(action)) return true;
        }
        return false;
    }

    // ============ QUẢN LÝ ROLE ============

    /** Gán role cho account */
    @Override @Transactional
    public void assignRoleToUser(Integer accountId, Integer roleId) {
        Account account = findOne(accountId);
        Role role = roleRepository.findById(roleId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Role not found"));
        account.setRole(role);
        repository.save(account);
    }

    /** Xóa role của account */
    @Override @Transactional
    public void removeRoleFromUser(Integer accountId) {
        Account account = findOne(accountId);
        account.setRole(null);
        repository.save(account);
    }

    /** Lấy danh sách role của account */
    @Override
    public List<RoleResponse> getUserRoles(Integer accountId) {
        Account account = findOne(accountId);
        if (account.getRole() == null) return new ArrayList<>();
        Role role = account.getRole();
        RoleResponse roleResponse = RoleResponse.builder()
                .idRole(role.getIdRole())
                .roleName(role.getRoleName())
                .accountCount(role.getAccounts() != null ? role.getAccounts().size() : 0)
                .build();
        return List.of(roleResponse);
    }

    /** Lấy danh sách user theo role */
    @Override
    public List<UserInfoResponse> getUsersByRole(Integer roleId) {
        Role role = roleRepository.findById(roleId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Role not found"));
        List<Account> accounts = repository.findByRole(role);
        return accounts.stream().map(account -> buildUserInfoResponse(account, role.getRoleName())).collect(Collectors.toList());
    }

    /** Lấy tất cả user */
    @Override
    public List<UserInfoResponse> getAllUsers() {
        List<Account> accounts = repository.findAllWithDetails();
        return accounts.stream().map(account -> {
            Role role = account.getRole();
            String roleName = role != null ? role.getRoleName() : "N/A";
            return buildUserInfoResponse(account, roleName);
        }).collect(Collectors.toList());
    }

    /** Lấy tất cả teacher */
    @Override
    public List<UserInfoResponse> getAllTeachers() {
        List<Account> teachers = repository.findAllTeachers();
        return teachers.stream().map(account -> buildUserInfoResponse(account, "TEACHER")).collect(Collectors.toList());
    }

    // ============ SPRING SECURITY ============

    /** Load user cho Spring Security, trả về CustomUserDetails */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = repository.findByUsernameWithDetails(username).orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new org.wisdom.oc01.security.CustomUserDetails(account);
    }

    /** Lấy danh sách quyền của account kèm trạng thái active */
    @Override @Transactional(readOnly = true)
    public List<AccountPermissionResponse> getAccountPermissionsWithStatus(Integer accountId) {
        List<AccountPermission> accountPermissions = accountPermissionRepository.findByAccountIdAccount(accountId);
        return accountPermissions.stream().map(ap -> AccountPermissionResponse.builder()
                .idAccountPermission(ap.getIdAccountPermission())
                .idPermission(ap.getPermission().getIdPermission())
                .permissionName(ap.getPermission().getPermissionName())
                .resource(ap.getPermission().getResource())
                .action(ap.getPermission().getAction())
                .description(ap.getPermission().getDescription())
                .isDefault(ap.getPermission().getIsDefault())
                .isActive(ap.getIsActive())
                .createdAt(ap.getCreatedAt() != null ? ap.getCreatedAt().toString() : null)
                .build()).collect(Collectors.toList());
    }
}