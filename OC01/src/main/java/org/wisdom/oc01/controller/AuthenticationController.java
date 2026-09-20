package org.wisdom.oc01.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.request.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.response.UserInfoResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.User;
import org.wisdom.oc01.service.AuthenticationService;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    /**
     * Đăng ký tài khoản mới
     * POST /api/auth/register - Public
     */
    @PostMapping("/register")
    public ResponseEntity<RequestResponse> register(@Valid @RequestBody RegisterRequest request) {
        authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse("Registration successful. Please login."));
    }

    /**
     * Đăng nhập
     * POST /api/auth/login - Public
     */
    @PostMapping("/login")
    public ResponseEntity<RequestResponse> login(@Valid @RequestBody LoginDTO request, HttpServletResponse response) {
        authenticationService.login(request, response);
        return ResponseEntity.ok(new RequestResponse("Login successful"));
    }

    /**
     * Đăng xuất
     * POST /api/auth/logout - Authenticated
     */
    @PostMapping("/logout")
    public ResponseEntity<RequestResponse> logout(HttpServletResponse response) {
        authenticationService.logout(response);
        return ResponseEntity.ok(new RequestResponse("Logout successful"));
    }

    /**
     * Lấy thông tin người dùng hiện tại
     * GET /api/auth/me - Authenticated
     */
    @GetMapping("/me")
    public ResponseEntity<RequestResponse> getCurrentUser() {
        Account account = authenticationService.getCurrentUser();
        User user = account.getUser();

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .idAccount(account.getIdAccount())
                .username(account.getUsername())
                .email(account.getEmail())
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .role(account.getRole().getRoleName())
                .provider(account.getProvider())
                .build();

        return ResponseEntity.ok(new RequestResponse(userInfo, "User information retrieved successfully"));
    }
    /**
     * Refresh Access Token
     * POST /api/auth/refresh-token - Public
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<RequestResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String newAccessToken = authenticationService.refreshToken(request, response);
        return ResponseEntity.ok(new RequestResponse(newAccessToken, "Token refreshed successfully"));
    }
    /**
     * Kiểm tra token còn hiệu lực không
     * GET /api/auth/check-token - Public
     */
    @GetMapping("/check-token")
    public ResponseEntity<RequestResponse> checkToken(HttpServletRequest request) {
        String token = authenticationService.getTokenFromRequest(request);
        if (token != null && authenticationService.validateToken(token)) {
            return ResponseEntity.ok(new RequestResponse("Token is valid"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new RequestResponse("Token is invalid or expired"));
    }

    /**
     * Bước 1: Gửi OTP
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<RequestResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authenticationService.forgotPassword(request);
        return ResponseEntity.ok(new RequestResponse("OTP sent to your email"));
    }

    /**
     * Bước 2: Xác thực OTP
     * POST /api/auth/verify-otp
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<RequestResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authenticationService.verifyOtp(request);
        return ResponseEntity.ok(new RequestResponse("OTP verified successfully"));
    }

    /**
     * Bước 3: Đặt lại mật khẩu
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<RequestResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
        return ResponseEntity.ok(new RequestResponse("Password reset successful"));
    }

    /**
     * Đổi mật khẩu (yêu cầu đã đăng nhập)
     * POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<RequestResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changePassword(request);
        return ResponseEntity.ok(new RequestResponse("Password changed successfully"));
    }
}