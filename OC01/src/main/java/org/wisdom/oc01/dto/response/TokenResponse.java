package org.wisdom.oc01.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;


@AllArgsConstructor
@Data
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String email;
}