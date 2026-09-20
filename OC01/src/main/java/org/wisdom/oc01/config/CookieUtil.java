package org.wisdom.oc01.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
public class CookieUtil {
    @Value("${cookie.access-token-name}")
    private String accessTokenName;

    @Value("${cookie.refresh-token-name}")
    private String refreshTokenName;

    @Value("${cookie.domain}")
    private String cookieDomain;

    @Value("${cookie.path}")
    private String cookiePath;

    @Value("${cookie.secure}")
    private boolean secure;

    @Value("${cookie.http-only}")
    private boolean httpOnly;

    @Value("${cookie.same-site}")
    private String sameSite;

    public void addAccessTokenCookie(HttpServletResponse response, String token, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(accessTokenName, token)
                .httpOnly(httpOnly)
                .secure(secure)
                .path(cookiePath)
                .domain(cookieDomain)
                .maxAge(maxAge)
                .sameSite(sameSite)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void addRefreshTokenCookie(HttpServletResponse response, String token, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(refreshTokenName, token)
                .httpOnly(httpOnly)
                .secure(secure)
                .path(cookiePath)
                .domain(cookieDomain)
                .maxAge(maxAge)
                .sameSite(sameSite)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void clearCookies(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from(accessTokenName, "")
                .httpOnly(httpOnly)
                .secure(secure)
                .path(cookiePath)
                .domain(cookieDomain)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
        response.addHeader("Set-Cookie", accessCookie.toString());

        ResponseCookie refreshCookie = ResponseCookie.from(refreshTokenName, "")
                .httpOnly(httpOnly)
                .secure(secure)
                .path(cookiePath)
                .domain(cookieDomain)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    public Optional<String> getAccessTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, accessTokenName);
    }

    public Optional<String> getRefreshTokenFromCookies(HttpServletRequest request) {
        return getCookieValue(request, refreshTokenName);
    }

    private Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}