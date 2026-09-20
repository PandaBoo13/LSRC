package org.wisdom.oc01.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;

/**
 * Filter kiểm tra quyền theo mapping URL + HTTP method → resource:action.
 *
 * Nguyên tắc:
 *  - FAIL-CLOSED: endpoint không có mapping → TỪ CHỐI (không phải cho qua).
 *  - Method-aware: matcher phải khớp cả HTTP method, không chỉ path.
 *  - Public path chỉ áp dụng cho safe methods (GET/HEAD/OPTIONS),
 *    trừ PUBLIC_AUTH_URLS (login/register) được phép mọi method.
 *  - Admin bypass nhưng KHÔNG ghi đè ownership ở tầng service.
 */
@Slf4j
@Component
public class PermissionMappingFilter extends OncePerRequestFilter {

    private final PermissionManager permissionManager;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> ADMIN_AUTHORITIES =
            Set.of("ROLE_ADMIN", "ADMIN", "ROLE_ADMIN2", "ADMIN2");

    /** Safe methods được phép đi qua public path mà không cần login. */
    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");

    public PermissionMappingFilter(PermissionManager permissionManager) {
        this.permissionManager = permissionManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod().toUpperCase();

        // 1. Admin bypass — chỉ bỏ qua tầng permission, KHÔNG bỏ qua ownership ở service.
        if (isAdmin()) {
            log.debug("Admin bypass: {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Public request (phải khớp method + path).
        if (isPublicRequest(method, path)) {
            log.debug("Public request: {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Bắt buộc phải đăng nhập.
        Integer accountId = SecurityUtils.getCurrentAccountId();
        if (accountId == null) {
            sendUnauthorized(response, "Chưa đăng nhập");
            return;
        }

        // 4. Path thuộc USER_URLS: chỉ yêu cầu authenticated, không cần permission cụ thể.
        //    Ownership vẫn phải check ở service layer (Hướng A).
        if (isUserPath(path)) {
            log.debug("Authenticated user path: {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        // 5. Kiểm tra permission mapping — FAIL-CLOSED.
        if (!checkPermission(accountId, method, path, response)) {
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Public request: phải khớp cả method và path.
     *  - PUBLIC_AUTH_URLS: cho mọi method (login/register/refresh là entrypoint).
     *  - PUBLIC_URLS: chỉ cho SAFE_METHODS (tránh POST/PUT/DELETE bypass).
     */
    private boolean isPublicRequest(String method, String path) {
        if (matchesAny(APIURL.PUBLIC_AUTH_URLS, path)) {
            return true;
        }
        return SAFE_METHODS.contains(method) && matchesAny(APIURL.PUBLIC_URLS, path);
    }

    private boolean isUserPath(String path) {
        return matchesAny(APIURL.USER_URLS, path);
    }

    private boolean matchesAny(String[] patterns, String path) {
        return Arrays.stream(patterns).anyMatch(p -> pathMatcher.match(p, path));
    }

    /**
     * Kiểm tra permission mapping — FAIL-CLOSED.
     * Không có mapping → TỪ CHỐI (chứ không phải cho qua).
     */
    private boolean checkPermission(Integer accountId,
                                    String method,
                                    String path,
                                    HttpServletResponse response) throws IOException {

        String[] permission = findPermission(method, path);

        if (permission == null) {
            log.warn("No permission mapping for: {} {} — DENY (fail-closed)", method, path);
            sendForbidden(response, "Endpoint chưa được cấu hình quyền");
            return false;
        }

        String resource = permission[0];
        String action = permission[1];

        if (!permissionManager.check(accountId, resource, action)) {
            log.warn("Account {} bị từ chối: {}:{} on {} {}",
                    accountId, resource, action, method, path);
            sendForbidden(response, "Không có quyền " + action + " trên " + resource);
            return false;
        }

        log.debug("Permission granted: {}:{} for account {} on {} {}",
                resource, action, accountId, method, path);
        return true;
    }

    /**
     * Tìm permission mapping cho (method, path).
     * Ưu tiên:
     *  1. Exact match (METHOD:path).
     *  2. Pattern match cụ thể nhất (ít wildcard nhất).
     */
    private String[] findPermission(String method, String path) {
        // 1. Exact match
        String exactKey = method + ":" + path;
        String[] exact = APIURL.API_PERMISSIONS.get(exactKey);
        if (exact != null) return exact;

        // 2. Pattern match — chọn pattern cụ thể nhất
        String[] bestMatch = null;
        int bestSpecificity = -1;

        for (Map.Entry<String, String[]> entry : APIURL.API_PERMISSIONS.entrySet()) {
            String key = entry.getKey();
            int colonIndex = key.indexOf(':');
            if (colonIndex <= 0) continue;

            String mappedMethod = key.substring(0, colonIndex);
            String mappedPattern = key.substring(colonIndex + 1);

            if (!method.equalsIgnoreCase(mappedMethod)) continue;
            if (!pathMatcher.match(mappedPattern, path)) continue;

            int specificity = mappedPattern.length() - countWildcards(mappedPattern) * 100;
            if (specificity > bestSpecificity) {
                bestSpecificity = specificity;
                bestMatch = entry.getValue();
            }
        }
        return bestMatch;
    }

    private int countWildcards(String pattern) {
        int count = 0;
        for (int i = 0; i < pattern.length(); i++) {
            if (pattern.charAt(i) == '*') count++;
        }
        return count;
    }

    /** Chỉ đọc Authentication, không query DB — tránh recursion khi filter đang chạy. */
    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(ADMIN_AUTHORITIES::contains);
    }

    private void sendForbidden(HttpServletResponse response, String message) throws IOException {
        writeError(response, HttpServletResponse.SC_FORBIDDEN, message);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        writeError(response, HttpServletResponse.SC_UNAUTHORIZED, message);
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Map.of("error", message)));
    }

    // shouldNotFilter đã được loại bỏ:
    // - Trước đây skip USER_URLS → bypass toàn bộ permission check.
    // - Nay logic đã nằm trong doFilterInternal (bước 4), an toàn hơn.
}