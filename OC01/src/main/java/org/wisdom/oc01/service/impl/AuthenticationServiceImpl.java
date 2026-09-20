package org.wisdom.oc01.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.*;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.entity.User;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.validator.AuthenticationValidator;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.RoleRepository;
import org.wisdom.oc01.config.CookieUtil;
import org.wisdom.oc01.config.JwtService;
import org.wisdom.oc01.service.AuthenticationService;
import org.wisdom.oc01.service.EmailService;
import org.wisdom.oc01.service.OtpService;
import java.security.SecureRandom;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    @Autowired private OtpService otpService;
    @Autowired private EmailService emailService;
    @Autowired private AccountRepository accountRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private CookieUtil cookieUtil;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private AuthenticationValidator validator;
    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpirationMs;

    // ==================== REGISTER ====================

    /** Đăng ký tài khoản mới: validate qua validator + tạo Account + User */
    @Override @Transactional
    public void register(RegisterRequest request) {
        boolean usernameExists = accountRepository.findByUsername(request.getUsername()).isPresent();
        boolean emailExists = accountRepository.findByEmail(request.getEmail()).isPresent();
        validator.validateForRegister(request, usernameExists, emailExists);
        // Tạo Account
        Account account = new Account();
        account.setUsername(request.getUsername().trim());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail().trim().toLowerCase());
        account.setProvider("local");
        // Gán role mặc định
        Role role = roleRepository.findById(3).orElseThrow(() -> new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR, "Default role not found"));
        account.setRole(role);
        // Tạo User
        User user = new User();
        user.setFirstName(request.getFirstName() != null ? request.getFirstName().trim() : null);
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : null);
        user.setAccount(account);
        account.setUser(user);
        accountRepository.save(account);
    }

    // ==================== LOGIN ====================

    /** Đăng nhập: validate input + xác thực qua AuthenticationManager, tạo access + refresh token và set cookie */
    @Override
    public void login(LoginDTO request, HttpServletResponse response) {
        validator.validateForLogin(request);
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername().trim(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            Account account = accountRepository.findByUsername(request.getUsername().trim()).orElseThrow(() -> new ErrorHandler(HttpStatus.UNAUTHORIZED, "Account not found"));
            // Tạo token
            String accessToken = jwtService.generateAccessTokenWithUserInfo(account.getUsername(), account.getIdAccount(), account.getEmail(), account.getRole().getRoleName());
            String refreshToken = jwtService.generateRefreshToken(account.getUsername());
            int accessAge = jwtService.getAccessTokenExpirationSeconds();
            int refreshAge = jwtService.getRefreshTokenExpirationSeconds();
            // Set cookies
            cookieUtil.addAccessTokenCookie(response, accessToken, accessAge);
            cookieUtil.addRefreshTokenCookie(response, refreshToken, refreshAge);
        } catch (BadCredentialsException e) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        } catch (ErrorHandler e) {
            throw e;
        } catch (Exception e) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }

    // ==================== LOGOUT ====================

    /** Đăng xuất: clear security context và xóa cookies */
    @Override
    public void logout(HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        cookieUtil.clearCookies(response);
    }

    // ==================== GET CURRENT USER ====================

    /** Lấy account hiện tại từ SecurityContext */
    @Override @Transactional
    public Account getCurrentUser() {
        Logger logger = LoggerFactory.getLogger(this.getClass());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Authentication: {}", authentication);
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String username = authentication.getName();
        logger.info("Finding account for username: {}", username);
        return accountRepository.findByUsernameWithDetails(username).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "User not found"));
    }

    // ==================== REFRESH TOKEN ====================

    /** Làm mới access token từ refresh token trong cookie */
    @Override
    public String refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieUtil.getRefreshTokenFromCookies(request).orElseThrow(() -> new ErrorHandler(HttpStatus.UNAUTHORIZED, "Refresh token not found"));
        // Validate refresh token
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Refresh token is empty");
        }
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Invalid token type");
        }
        if (jwtService.isTokenExpired(refreshToken)) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        String username = jwtService.extractUsername(refreshToken);
        if (username == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        Account account = accountRepository.findByUsername(username).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "User not found"));
        // Tạo access token mới
        String newAccessToken = jwtService.generateAccessTokenWithUserInfo(account.getUsername(), account.getIdAccount(), account.getEmail(), account.getRole().getRoleName());
        cookieUtil.addAccessTokenCookie(response, newAccessToken, jwtService.getAccessTokenExpirationSeconds());
        return newAccessToken;
    }

    // ==================== GET TOKEN FROM REQUEST ====================

    /** Lấy token từ header Authorization (Bearer) hoặc từ cookie */
    @Override
    public String getTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return cookieUtil.getAccessTokenFromCookies(request).orElse(null);
    }

    // ==================== VALIDATE TOKEN ====================

    /** Kiểm tra token có hợp lệ không */
    @Override
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        try {
            return jwtService.validateToken(token);
        } catch (Exception e) {
            return false;
        }
    }

    // ==================== FORGOT PASSWORD ====================

    /** Bước 1: Gửi OTP qua email để khôi phục mật khẩu */
    public void forgotPassword(ForgotPasswordRequest request) {
        validator.validateForForgotPassword(request);
        String email = request.getEmail().trim().toLowerCase();
        Account account = accountRepository.findByEmail(email).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Email not found"));
        String otp = generateOtp();
        otpService.saveOtp(email, otp);
        emailService.sendOtpEmail(email, otp);
    }

    // ==================== VERIFY OTP ====================

    /** Bước 2: Xác thực OTP */
    public void verifyOtp(VerifyOtpRequest request) {
        validator.validateForVerifyOtp(request);
        String email = request.getEmail().trim().toLowerCase();
        if (!otpService.isOtpValid(email, request.getOtp())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }
        otpService.markEmailAsVerified(email);
    }

    // ==================== RESET PASSWORD ====================

    /** Bước 3: Đặt lại mật khẩu mới sau khi đã verify OTP */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        validator.validateForResetPassword(request);
        String email = request.getEmail().trim().toLowerCase();
        // Kiểm tra email đã verify OTP chưa
        validator.validateEmailVerified(otpService.isEmailVerified(email));
        Account account = accountRepository.findByEmail(email).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Account not found"));
        // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
        boolean isSame = passwordEncoder.matches(request.getNewPassword(), account.getPassword());
        validator.validateNewPasswordDifferentFromCurrent(isSame);
        // Cập nhật mật khẩu mới
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
        // Xóa trạng thái verified
        otpService.clearEmailVerified(email);
        // Gửi email thông báo
        emailService.sendPasswordChangedEmail(email);
    }

    // ==================== CHANGE PASSWORD ====================

    /** Đổi mật khẩu (yêu cầu đã đăng nhập) */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        validator.validateForChangePassword(request);
        // Kiểm tra đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Account not found"));
        // Kiểm tra mật khẩu cũ
        boolean matches = passwordEncoder.matches(request.getCurrentPassword(), account.getPassword());
        validator.validateCurrentPasswordMatches(matches);
        // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
        boolean isSame = passwordEncoder.matches(request.getNewPassword(), account.getPassword());
        validator.validateNewPasswordDifferentFromCurrent(isSame);
        // Cập nhật mật khẩu mới
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    // ==================== UTILS ====================

    /** Sinh OTP 6 chữ số ngẫu nhiên */
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}