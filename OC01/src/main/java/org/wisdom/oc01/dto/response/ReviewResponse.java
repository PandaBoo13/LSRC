// ============================================
// ReviewResponse.java - Response DTO
// ============================================
package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewResponse {

    private Integer id;
    private Integer courseId;
    private String courseTitle;
    private Integer accountId;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}