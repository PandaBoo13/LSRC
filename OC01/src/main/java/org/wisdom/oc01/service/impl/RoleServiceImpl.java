package org.wisdom.oc01.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.RoleRequest;
import org.wisdom.oc01.dto.response.RoleResponse;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.ServiceImpl;
import org.wisdom.oc01.repository.RoleRepository;
import org.wisdom.oc01.service.RoleService;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl extends ServiceImpl<Role, Integer, RoleRepository> implements RoleService {

    public RoleServiceImpl(RoleRepository repository) {
        super(repository);
    }

    // ============ CRUD ============

    /** Tạo role mới, kiểm tra trùng tên */
    @Override @Transactional
    public RoleResponse createRole(RoleRequest request) {
        if (repository.existsByRoleName(request.getRoleName())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Role name already exists");
        }
        Role role = new Role();
        role.setRoleName(request.getRoleName());
        repository.save(role);
        return mapToResponse(role);
    }

    /** Cập nhật role, kiểm tra trùng tên (loại trừ chính nó) */
    @Override @Transactional
    public RoleResponse updateRole(Integer id, RoleRequest request) {
        Role role = findOne(id);
        if (!role.getRoleName().equals(request.getRoleName()) && repository.existsByRoleName(request.getRoleName())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Role name already exists");
        }
        role.setRoleName(request.getRoleName());
        repository.save(role);
        return mapToResponse(role);
    }

    /** Xóa role, không cho xóa nếu có account đang dùng */
    @Override @Transactional
    public void delete(Integer id) {
        Role role = findOne(id);
        // Kiểm tra có account nào đang dùng role này không
        if (role.getAccounts() != null && !role.getAccounts().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Cannot delete role. " + role.getAccounts().size() + " account(s) are using this role");
        }
        repository.delete(role);
    }

    // ============ QUERY ============

    /** Lấy tất cả role */
    @Override
    public List<RoleResponse> getAllRoles() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Lấy role theo ID */
    @Override
    public RoleResponse getRoleById(Integer id) {
        Role role = findOne(id);
        return mapToResponse(role);
    }

    /** Lấy danh sách role theo accountId */
    @Override
    public List<RoleResponse> getRolesByAccountId(Integer accountId) {
        return repository.findByAccounts_IdAccount(accountId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ============ MAPPER ============

    /** Map Role → RoleResponse */
    private RoleResponse mapToResponse(Role role) {
        return RoleResponse.builder()
                .idRole(role.getIdRole())
                .roleName(role.getRoleName())
                .accountCount(role.getAccounts() != null ? role.getAccounts().size() : 0)
                .build();
    }
}