// ============================================
// LecturerProfileRequest.java - Request DTO
// ============================================
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LecturerProfileRequest {

    private String specialties;

    @Size(max = 5000, message = "Chuyên môn không được vượt quá 5000 ký tự")
    private String expertise;

    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    private Integer experienceYears;

    @Size(max = 5000, message = "Học vấn không được vượt quá 5000 ký tự")
    private String education;

    @Size(max = 500, message = "Website không được vượt quá 500 ký tự")
    private String website;

    @Size(max = 500, message = "LinkedIn không được vượt quá 500 ký tự")
    private String linkedin;
}