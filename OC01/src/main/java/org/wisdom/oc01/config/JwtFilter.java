package org.wisdom.oc01.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.service.AccountService;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired private JwtService jwtService;
    @Autowired @Lazy private AccountService accountService;
    @Autowired private CookieUtil cookieUtil;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /** Filter chính: skip auth/public GET, còn lại validate token và set Authentication */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. BỎ QUA AUTH ENDPOINTS - không cần token
        if (isAuthPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. ✅ FIXED: Parse token nếu có, KHÔNG bắt buộc cho public GET
        boolean isPublicGet = "GET".equalsIgnoreCase(method) && isPublicPath(path);

        // Đọc cookie
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // ✅ Nếu có token → parse + set Authentication (kể cả public GET)
        if (token != null) {
            try {
                if (jwtService.isAccessToken(token) && !jwtService.isTokenExpired(token)) {
                    String username = jwtService.extractUsername(token);
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = accountService.loadUserByUsername(username);
                        if (jwtService.validateToken(token, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails, null, userDetails.getAuthorities());
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            } catch (Exception e) {
//                log.warn("JWT parse failed for public GET: {}", e.getMessage());
                // Không return — public GET không cần token
            }
        }

        // ✅ Nếu là public GET → cho qua dù có token hay không
        if (isPublicGet) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Non-public request: bắt buộc phải có token
        if (token == null) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Access token not found");
            return;
        }

        // ✅ Token đã parse ở trên, nếu chưa set Authentication → lỗi
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid access token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /** Kiểm tra path có phải là AUTH endpoint không — các endpoint này KHÔNG cần access token */
    private boolean isAuthPath(String path) {
        String[] authPaths = {
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/refresh-token",
                "/api/auth/forgot-password",
                "/api/auth/verify-otp",
                "/api/auth/reset-password",
                "/api/auth/check-token",
                "/oauth2/authorization",
                "/api/oauth2"
        };
        for (String authPath : authPaths) {
            if (path.startsWith(authPath)) {
                return true;
            }
        }
        return false;
    }

    /** Kiểm tra path có phải là public GET không */
    private boolean isPublicPath(String path) {
        for (String publicUrl : APIURL.PUBLIC_GET_URLS) {
            if (pathMatcher.match(publicUrl, path)) {
                return true;
            }
        }
        return false;
    }

    /** Gửi response lỗi dạng JSON */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        RequestResponse errorResponse = new RequestResponse(message);
        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
        response.getWriter().flush();
    }
}