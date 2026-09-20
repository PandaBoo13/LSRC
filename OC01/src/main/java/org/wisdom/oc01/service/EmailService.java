package org.wisdom.oc01.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
    void sendPasswordChangedEmail(String to);
}