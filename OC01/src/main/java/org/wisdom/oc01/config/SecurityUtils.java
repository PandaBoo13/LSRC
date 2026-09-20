package org.wisdom.oc01.config;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.security.CustomUserDetails;

/**
 * Nguồn duy nhất đọc SecurityContext.
 * - get*(): trả null nếu chưa đăng nhập (dùng cho filter/aspect).
 * - require*(): throw 401 nếu chưa đăng nhập (dùng cho service/controller).
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /** Trả null nếu chưa đăng nhập. */
    public static Account getCurrentAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof CustomUserDetails cud) return cud.getAccount();
        if (principal instanceof Account acc) return acc;
        return null;
    }

    /** Throw 401 nếu chưa đăng nhập. */
    public static Account requireCurrentAccount() {
        Account account = getCurrentAccount();
        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        return account;
    }

    /** Trả null nếu chưa đăng nhập. */
    public static Integer getCurrentAccountId() {
        Account account = getCurrentAccount();
        return account != null ? account.getIdAccount() : null;
    }

    /** Throw 401 nếu chưa đăng nhập. */
    public static Integer requireCurrentAccountId() {
        return requireCurrentAccount().getIdAccount();
    }

    /** Trả null nếu chưa đăng nhập. */
    public static String getCurrentUsername() {
        Account account = getCurrentAccount();
        return account != null ? account.getUsername() : null;
    }

    /** Kiểm tra account hiện tại có role cụ thể không. */
    public static boolean hasRole(String roleName) {
        Account account = getCurrentAccount();
        if (account == null || account.getRole() == null) return false;
        return account.getRole().getRoleName().equalsIgnoreCase(roleName);
    }

    /** Kiểm tra đã đăng nhập chưa. */
    public static boolean isAuthenticated() {
        return getCurrentAccount() != null;
    }
}