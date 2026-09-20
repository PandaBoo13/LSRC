package org.wisdom.oc01.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.PermissionRequest;
import org.wisdom.oc01.dto.response.PermissionResponse;
import org.wisdom.oc01.entity.Permission;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.ServiceImpl;
import org.wisdom.oc01.repository.AccountPermissionRepository;
import org.wisdom.oc01.repository.PermissionRepository;
import org.wisdom.oc01.service.PermissionService;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermissionServiceImpl extends ServiceImpl<Permission, Integer, PermissionRepository> implements PermissionService {
    @Autowired private AccountPermissionRepository accountPermissionRepository;

    public PermissionServiceImpl(PermissionRepository repository) {
        super(repository);
    }

    /** Tạo permission mới, kiểm tra trùng tên */
    @Override @Transactional
    public PermissionResponse createPermission(PermissionRequest request) {
        if (repository.existsByPermissionName(request.getPermissionName())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Permission name already exists");
        }
        Permission permission = new Permission();
        permission.setPermissionName(request.getPermissionName());
        permission.setResource(request.getResource());
        permission.setAction(request.getAction());
        permission.setDescription(request.getDescription());
        permission.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        repository.save(permission);
        return mapToResponse(permission);
    }

    /** Cập nhật permission, kiểm tra trùng tên (loại trừ chính nó) */
    @Override @Transactional
    public PermissionResponse updatePermission(Integer id, PermissionRequest request) {
        Permission permission = findOne(id);
        if (!permission.getPermissionName().equals(request.getPermissionName()) && repository.existsByPermissionName(request.getPermissionName())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Permission name already exists");
        }
        permission.setPermissionName(request.getPermissionName());
        permission.setResource(request.getResource());
        permission.setAction(request.getAction());
        permission.setDescription(request.getDescription());
        if (request.getIsDefault() != null) {
            permission.setIsDefault(request.getIsDefault());
        }
        repository.save(permission);
        return mapToResponse(permission);
    }

    /** Lấy tất cả permission */
    @Override
    public List<PermissionResponse> getAllPermissions() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Lấy permission theo ID */
    @Override
    public PermissionResponse getPermissionById(Integer id) {
        Permission permission = findOne(id);
        return mapToResponse(permission);
    }

    /** Lấy danh sách permission mặc định */
    @Override
    public List<PermissionResponse> getDefaultPermissions() {
        return repository.findByIsDefaultTrue().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Map Permission → PermissionResponse */
    private PermissionResponse mapToResponse(Permission permission) {
        return PermissionResponse.builder()
                .idPermission(permission.getIdPermission())
                .permissionName(permission.getPermissionName())
                .resource(permission.getResource())
                .action(permission.getAction())
                .description(permission.getDescription())
                .isDefault(permission.getIsDefault())
                .build();
    }
}