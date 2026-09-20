package org.wisdom.oc01.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtService {
    @Value("${jwt.secret:HarlestXakasjdhh12sadadwqdasdeascfasddacxajkasdjndhwnas}")
    private String jwtKey;
    @Value("${jwt.access-token-expiration:30000}")
    private Long accessTokenExpiration;
    @Value("${jwt.refresh-token-expiration:120000}")
    private Long refreshTokenExpiration;

    /** Tạo SecretKey HMAC từ jwtKey */
    private SecretKey getSignKey() {
        byte[] keyBytes = jwtKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Tạo Access Token chỉ với username */
    public String generateAccessToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return generateAccessToken(claims, username);
    }

    /** Tạo Access Token với claims tùy chỉnh */
    public String generateAccessToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSignKey())
                .compact();
    }

    /** Tạo Access Token với đầy đủ thông tin user (userId, email, role, tokenType) */
    public String generateAccessTokenWithUserInfo(String username, Integer userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        claims.put("tokenType", "access");
        return generateAccessToken(claims, username);
    }

    /** Tạo Refresh Token chỉ với username */
    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tokenType", "refresh");
        return generateRefreshToken(claims, username);
    }

    /** Tạo Refresh Token với claims tùy chỉnh */
    public String generateRefreshToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSignKey())
                .compact();
    }

    /** Lấy username từ token */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Lấy thời điểm hết hạn từ token */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /** Lấy toàn bộ claims từ token */
    public Claims extractAllClaimsFromToken(String token) {
        return extractAllClaims(token);
    }

    /** Lấy một claim cụ thể theo key và kiểu */
    public <T> T extractClaim(String token, String claimKey, Class<T> claimType) {
        Claims claims = extractAllClaims(token);
        return claims.get(claimKey, claimType);
    }

    /** Lấy claim theo hàm resolver */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /** Parse token với JJWT 0.12.6 */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Kiểm tra token đã hết hạn chưa */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /** Validate token với UserDetails */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /** Validate token chỉ với token (không cần UserDetails) */
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /** Kiểm tra token có phải là access token không */
    public Boolean isAccessToken(String token) {
        try {
            String tokenType = extractClaim(token, "tokenType", String.class);
            return "access".equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    /** Kiểm tra token có phải là refresh token không */
    public Boolean isRefreshToken(String token) {
        try {
            String tokenType = extractClaim(token, "tokenType", String.class);
            return "refresh".equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    /** Lấy thời gian sống access token (giây) */
    public int getAccessTokenExpirationSeconds() {
        return (int) (accessTokenExpiration / 1000);
    }

    /** Lấy thời gian sống refresh token (giây) */
    public int getRefreshTokenExpirationSeconds() {
        return (int) (refreshTokenExpiration / 1000);
    }
}