package org.wisdom.oc01.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Integer idAccount;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String provider;

    // Field mới
    private String phone;
    private String avatarUrl;
    private String bio;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDateTime updatedAt;
}