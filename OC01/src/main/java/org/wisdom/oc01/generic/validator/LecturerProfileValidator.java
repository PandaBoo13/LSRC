// ============================================
// LecturerProfileValidator.java - Validator
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.LecturerProfile;
import org.wisdom.oc01.exception.ErrorHandler;

@Component
public class LecturerProfileValidator {

    public void validate(LecturerProfile profile) {
        validateAccount(profile);
        validateExperienceYears(profile);
        validateWebsite(profile);
        validateLinkedin(profile);
    }

    public void validateForCreate(LecturerProfile profile, boolean alreadyExists) {
        validate(profile);
        if (alreadyExists) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Giảng viên đã có hồ sơ rồi");
        }
    }

    public void validateForUpdate(LecturerProfile profile) {
        validate(profile);
    }

    private void validateAccount(LecturerProfile profile) {
        if (profile.getAccount() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Hồ sơ phải có giảng viên");
        }
    }

    private void validateExperienceYears(LecturerProfile profile) {
        if (profile.getExperienceYears() != null && profile.getExperienceYears() < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số năm kinh nghiệm không được âm");
        }
        if (profile.getExperienceYears() != null && profile.getExperienceYears() > 100) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số năm kinh nghiệm không được vượt quá 100");
        }
    }

    private void validateWebsite(LecturerProfile profile) {
        if (profile.getWebsite() != null && profile.getWebsite().length() > 500) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Website không được vượt quá 500 ký tự");
        }
    }

    private void validateLinkedin(LecturerProfile profile) {
        if (profile.getLinkedin() != null && profile.getLinkedin().length() > 500) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "LinkedIn không được vượt quá 500 ký tự");
        }
    }
}