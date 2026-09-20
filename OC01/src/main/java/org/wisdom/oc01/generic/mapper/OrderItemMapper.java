// ============================================
// OrderItemMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.OrderItemResponse;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.OrderItem;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OrderItemMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== ENTITY → RESPONSE ====================

    public OrderItemResponse toResponse(OrderItem item) {
        Course course = item.getCourse();
        return OrderItemResponse.builder()
                .id(item.getId())
                .orderId(item.getOrder() != null ? item.getOrder().getId() : null)
                .accountId(item.getAccount() != null ? item.getAccount().getIdAccount() : null)
                .courseId(course.getIdCourse())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .courseThumbnailUrl(course.getThumbnailUrl())
                .price(item.getPrice())
                .discount(item.getDiscount())
                .finalPrice(item.getFinalPrice())
                .enrollmentType(item.getEnrollmentType() != null ? item.getEnrollmentType().name() : null)
                .progress(item.getProgress())
                .status(item.getStatus() != null ? item.getStatus().name() : null)
                .completedAt(item.getCompletedAt())
                .build();
    }

    // ==================== ENTITY → JSON ====================

    public String toJson(OrderItem item) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", item.getId());
            data.put("orderId", item.getOrder() != null ? item.getOrder().getId() : null);
            data.put("accountId", item.getAccount() != null ? item.getAccount().getIdAccount() : null);
            data.put("courseId", item.getCourse() != null ? item.getCourse().getIdCourse() : null);
            data.put("price", item.getPrice());
            data.put("discount", item.getDiscount());
            data.put("finalPrice", item.getFinalPrice());
            data.put("enrollmentType", item.getEnrollmentType() != null ? item.getEnrollmentType().name() : null);
            data.put("progress", item.getProgress());
            data.put("status", item.getStatus() != null ? item.getStatus().name() : null);
            data.put("completedAt", item.getCompletedAt());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}