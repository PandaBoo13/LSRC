package org.wisdom.oc01.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.wisdom.oc01.dto.request.*;
import org.wisdom.oc01.entity.Account;

public interface AuthenticationService {
    void register(RegisterRequest request);
    void login(LoginDTO request, HttpServletResponse response);
    void logout(HttpServletResponse response);
    Account getCurrentUser();
    String refreshToken(HttpServletRequest request, HttpServletResponse response);
    String getTokenFromRequest(HttpServletRequest request);
    boolean validateToken(String token);
    void forgotPassword(ForgotPasswordRequest request);
    void verifyOtp(VerifyOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(ChangePasswordRequest request);
}