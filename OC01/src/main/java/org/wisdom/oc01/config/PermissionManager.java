package org.wisdom.oc01.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.UserPermissionsResponse;
import org.wisdom.oc01.service.AccountService;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Trung tâm kiểm tra & cache quyền của account. Cache in-memory để tránh query DB mỗi request. */
@Slf4j @Component public class PermissionManager {
    private final AccountService accountService;
    private final Map<Integer, UserPermissionsResponse> cache = new ConcurrentHashMap<>();

    public PermissionManager(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Kiểm tra account có quyền (resource, action) không.
     * Trả false nếu accountId null hoặc không có quyền.
     */
    public boolean check(Integer accountId, String resource, String action) {
        if (accountId == null || resource == null || action == null) {
            return false;
        }
        UserPermissionsResponse perms = getPermissions(accountId);
        Map<String, List<String>> byResource = perms.getPermissionsByResource();
        if (byResource == null) {
            return false;
        }
        List<String> actions = byResource.get(resource);
        return actions != null && actions.contains(action);
    }

    /** Xóa cache của 1 account — gọi sau khi gán/thu hồi role hoặc permission */
    public void clearCache(Integer accountId) {
        if (accountId != null) {
            cache.remove(accountId);
        }
    }

    /** Xóa toàn bộ cache */
    public void clearAllCache() {
        cache.clear();
    }

    /**
     * Lấy permissions từ cache, nếu chưa có thì load từ DB rồi cache lại.
     * computeIfAbsent đảm bảo atomic — 2 thread cùng miss thì chỉ 1 thread chạy loader.
     */
    private UserPermissionsResponse getPermissions(Integer accountId) {
        return cache.computeIfAbsent(accountId, id -> {
            try {
                return accountService.getUserPermissions(id);
            } catch (Exception e) {
                log.error("❌ Lỗi load permissions cho account {}: {}", id, e.getMessage());
                // Trả về response rỗng để không cache giá trị lỗi
                return UserPermissionsResponse.builder()
                        .accountId(id)
                        .roles(List.of())
                        .permissions(List.of())
                        .permissionsByResource(Map.of())
                        .build();
            }
        });
    }
}