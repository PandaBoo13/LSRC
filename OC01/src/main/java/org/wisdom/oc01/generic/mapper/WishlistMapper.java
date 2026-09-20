// ============================================
// WishlistMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.WishlistResponse;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.Wishlist;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class WishlistMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WishlistResponse toResponse(Wishlist wishlist) {
        Course course = wishlist.getCourse();
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .accountId(wishlist.getAccount().getIdAccount())
                .courseId(course.getIdCourse())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .courseThumbnailUrl(course.getThumbnailUrl())
                .coursePrice(course.getPrice())
                .courseOldPrice(course.getOldPrice())
                .courseIsFree(course.getIsFree())
                .courseStatus(course.getStatus() != null ? course.getStatus().name() : null)
                .addedAt(wishlist.getAddedAt())
                .build();
    }

    public String toJson(Wishlist wishlist) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", wishlist.getId());
            data.put("accountId", wishlist.getAccount() != null ? wishlist.getAccount().getIdAccount() : null);
            data.put("courseId", wishlist.getCourse() != null ? wishlist.getCourse().getIdCourse() : null);
            data.put("addedAt", wishlist.getAddedAt());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}