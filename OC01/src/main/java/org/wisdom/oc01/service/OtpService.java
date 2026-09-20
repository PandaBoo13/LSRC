package org.wisdom.oc01.service;

public interface OtpService {
    void saveOtp(String email, String otp);
    String getOtp(String email);
    void deleteOtp(String email);
    boolean isOtpValid(String email, String otp);

    // Thêm cho cách 2
    void markEmailAsVerified(String email);
    boolean isEmailVerified(String email);
    void clearEmailVerified(String email);
}