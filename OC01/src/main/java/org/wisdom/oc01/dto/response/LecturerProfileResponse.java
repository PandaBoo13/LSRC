// ============================================
// LecturerProfileResponse.java - Response DTO
// ============================================
package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LecturerProfileResponse {

    private Integer id;
    private Integer accountId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String specialties;
    private String expertise;
    private Integer experienceYears;
    private String education;
    private String website;
    private String linkedin;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}