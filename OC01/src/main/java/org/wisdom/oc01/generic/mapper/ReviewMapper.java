// ============================================
// ReviewMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.ReviewResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Review;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ReviewMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReviewResponse toResponse(Review review) {
        Account account = review.getAccount();
        return ReviewResponse.builder()
                .id(review.getIdReview())
                .courseId(review.getCourse().getIdCourse())
                .courseTitle(review.getCourse().getTitle())
                .accountId(account.getIdAccount())
                .username(account.getUsername())
                .firstName(account.getUser() != null ? account.getUser().getFirstName() : null)
                .lastName(account.getUser() != null ? account.getUser().getLastName() : null)
                .avatarUrl(account.getUser() != null ? account.getUser().getAvatarUrl() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public String toJson(Review review) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", review.getIdReview());
            data.put("courseId", review.getCourse() != null ? review.getCourse().getIdCourse() : null);
            data.put("accountId", review.getAccount() != null ? review.getAccount().getIdAccount() : null);
            data.put("rating", review.getRating());
            data.put("comment", review.getComment());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}