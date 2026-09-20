package org.wisdom.oc01.generic.validator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.request.*;
import org.wisdom.oc01.exception.ErrorHandler;

/**
 * ============================================================
 * AUTHENTICATION VALIDATOR - KIỂM TRA DỮ LIỆU XÁC THỰC
 * ============================================================
 * Chức năng:
 * - Validate dữ liệu đăng ký / đăng nhập
 * - Validate quên mật khẩu / OTP / reset password
 * - Validate đổi mật khẩu
 * ============================================================
 */
@Slf4j
@Component
public class AuthenticationValidator {

    // Regex dùng chung
    private static final String USERNAME_REGEX = "^[a-zA-Z0-9._-]+$";
    private static final String EMAIL_REGEX = "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$";
    private static final String OTP_REGEX = "\\d{6}";

    // ==================== VALIDATE TỔNG HỢP ====================

    /**
     * Validate đăng ký tài khoản
     */
    public void validateForRegister(RegisterRequest request,
                                    boolean usernameExists,
                                    boolean emailExists) {
        validateUsername(request.getUsername());
        validateEmail(request.getEmail());
        validatePassword(request.getPassword());
        validateFirstName(request.getFirstName());
        validateLastName(request.getLastName());

        if (usernameExists) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        if (emailExists) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Email already exists");
        }
    }

    /**
     * Validate đăng nhập
     */
    public void validateForLogin(LoginDTO request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Password is required");
        }
    }

    /**
     * Validate yêu cầu quên mật khẩu (gửi OTP)
     */
    public void validateForForgotPassword(ForgotPasswordRequest request) {
        validateEmail(request.getEmail());
    }

    /**
     * Validate xác thực OTP
     */
    public void validateForVerifyOtp(VerifyOtpRequest request) {
        validateEmail(request.getEmail());
        validateOtp(request.getOtp());
    }

    /**
     * Validate đặt lại mật khẩu mới
     */
    public void validateForResetPassword(ResetPasswordRequest request) {
        validateEmail(request.getEmail());
        validateNewPassword(request.getNewPassword());
    }

    /**
     * Validate đổi mật khẩu (yêu cầu đăng nhập)
     */
    public void validateForChangePassword(ChangePasswordRequest request) {
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Current password is required");
        }
        validateNewPassword(request.getNewPassword());
    }

    // ==================== VALIDATE TRẠNG THÁI ====================

    /**
     * Kiểm tra mật khẩu mới phải khác mật khẩu hiện tại
     */
    public void validateNewPasswordDifferentFromCurrent(boolean isSamePassword) {
        if (isSamePassword) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "New password must be different from current password");
        }
    }

    /**
     * Kiểm tra email đã xác thực OTP chưa (dùng cho reset password)
     */
    public void validateEmailVerified(boolean isVerified) {
        if (!isVerified) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "OTP not verified. Please verify OTP first");
        }
    }

    /**
     * Kiểm tra mật khẩu hiện tại có khớp không (dùng cho change password)
     */
    public void validateCurrentPasswordMatches(boolean isMatch) {
        if (!isMatch) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
    }

    // ==================== VALIDATE ENUM / FORMAT ====================

    /**
     * Validate username
     */
    public void validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (username.length() < 3 || username.length() > 50) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Username must be between 3 and 50 characters");
        }
        if (!username.matches(USERNAME_REGEX)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Username can only contain letters, numbers, dots, underscores, hyphens");
        }
    }

    /**
     * Validate email
     */
    public void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!email.matches(EMAIL_REGEX)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Invalid email format");
        }
        if (email.length() > 100) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Email must be less than 100 characters");
        }
    }

    /**
     * Validate OTP (6 chữ số)
     */
    public void validateOtp(String otp) {
        if (otp == null || otp.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "OTP is required");
        }
        if (!otp.matches(OTP_REGEX)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "OTP must be 6 digits");
        }
    }

    // ==================== VALIDATE PRIVATE ====================

    /**
     * Validate password khi đăng ký (bắt buộc)
     */
    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (password.length() < 6) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        if (password.length() > 100) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Password must be less than 100 characters");
        }
    }

    /**
     * Validate mật khẩu mới (cho reset / change)
     */
    private void validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "New password is required");
        }
        if (newPassword.length() < 6) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        if (newPassword.length() > 100) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Password must be less than 100 characters");
        }
    }

    /**
     * Validate firstName (optional)
     */
    private void validateFirstName(String firstName) {
        if (firstName != null && firstName.length() > 50) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "First name must be less than 50 characters");
        }
    }

    /**
     * Validate lastName (optional)
     */
    private void validateLastName(String lastName) {
        if (lastName != null && lastName.length() > 50) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Last name must be less than 50 characters");
        }
    }
}