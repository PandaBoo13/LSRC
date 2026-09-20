package org.wisdom.oc01.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.exception.ErrorHandler;

/**
 * AOP check quyền trước khi vào method có @RequirePermission.
 * Dùng static SecurityUtils vì aspect chạy ở proxy layer,
 * không cần (và không nên) inject service bean vào.
 */
@Aspect
@Component
public class PermissionAspect {

    private final PermissionManager permissionManager;

    public PermissionAspect(PermissionManager permissionManager) {
        this.permissionManager = permissionManager;
    }

    @Around("@annotation(requirePermission)")
    public Object check(ProceedingJoinPoint joinPoint,
                        RequirePermission requirePermission) throws Throwable {

        Integer accountId = SecurityUtils.getCurrentAccountId();
        if (accountId == null) {
            // 401 — nhất quán với PermissionMappingFilter
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        String resource = requirePermission.resource();
        String action = requirePermission.action();

        if (!permissionManager.check(accountId, resource, action)) {
            // 403 — nhất quán với PermissionMappingFilter
            throw new ErrorHandler(
                    HttpStatus.FORBIDDEN,
                    "Không có quyền " + action + " trên " + resource);
        }

        return joinPoint.proceed();
    }
}