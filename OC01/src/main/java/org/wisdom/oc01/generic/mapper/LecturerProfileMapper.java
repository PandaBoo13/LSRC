// ============================================
// LecturerProfileMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.LecturerProfileResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.LecturerProfile;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class LecturerProfileMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public LecturerProfileResponse toResponse(LecturerProfile profile) {
        Account account = profile.getAccount();
        return LecturerProfileResponse.builder()
                .id(profile.getId())
                .accountId(account.getIdAccount())
                .username(account.getUsername())
                .email(account.getEmail())
                .firstName(account.getUser() != null ? account.getUser().getFirstName() : null)
                .lastName(account.getUser() != null ? account.getUser().getLastName() : null)
                .avatarUrl(account.getUser() != null ? account.getUser().getAvatarUrl() : null)
                .specialties(profile.getSpecialties())
                .expertise(profile.getExpertise())
                .experienceYears(profile.getExperienceYears())
                .education(profile.getEducation())
                .website(profile.getWebsite())
                .linkedin(profile.getLinkedin())
                .isActive(profile.getIsActive())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public String toJson(LecturerProfile profile) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", profile.getId());
            data.put("accountId", profile.getAccount() != null ? profile.getAccount().getIdAccount() : null);
            data.put("specialties", profile.getSpecialties());
            data.put("expertise", profile.getExpertise());
            data.put("experienceYears", profile.getExperienceYears());
            data.put("education", profile.getEducation());
            data.put("website", profile.getWebsite());
            data.put("linkedin", profile.getLinkedin());
            data.put("isActive", profile.getIsActive());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}