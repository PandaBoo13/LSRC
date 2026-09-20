// ============================================
// ProgressMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.ProgressResponse;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.Progress;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ProgressMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== ENTITY → RESPONSE ====================

    public ProgressResponse toResponse(Progress progress) {
        Course course = progress.getCourse();
        String username = progress.getAccount() != null
                ? progress.getAccount().getUsername()
                : null;

        return ProgressResponse.builder()
                .id(progress.getId())
                .accountId(progress.getAccount().getIdAccount())
                .username(username)
                .courseId(course.getIdCourse())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .progressType(progress.getProgressType())
                .referenceId(progress.getReferenceId())
                .referenceType(progress.getReferenceType())
                .status(progress.getStatus())
                .progressPercentage(progress.getProgressPercentage())
                .totalTimeSpent(progress.getTotalTimeSpent())
                .score(progress.getScore())
                .maxScore(progress.getMaxScore())
                .attempts(progress.getAttempts())
                .isPassed(progress.getIsPassed())
                .notes(progress.getNotes())
                .totalItems(progress.getTotalItems())
                .completedItems(progress.getCompletedItems())
                .weightedScore(progress.getWeightedScore())
                .totalWeightPercent(progress.getTotalWeightPercent())
                .startedAt(progress.getStartedAt())
                .completedAt(progress.getCompletedAt())
                .lastAccessedAt(progress.getLastAccessedAt())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }

    // ==================== ENTITY → JSON ====================

    public String toJson(Progress progress) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", progress.getId());
            data.put("accountId", progress.getAccount() != null ? progress.getAccount().getIdAccount() : null);
            data.put("username", progress.getAccount() != null ? progress.getAccount().getUsername() : null);
            data.put("courseId", progress.getCourse() != null ? progress.getCourse().getIdCourse() : null);
            data.put("progressType", progress.getProgressType());
            data.put("referenceId", progress.getReferenceId());
            data.put("referenceType", progress.getReferenceType());
            data.put("status", progress.getStatus());
            data.put("progressPercentage", progress.getProgressPercentage());
            data.put("totalTimeSpent", progress.getTotalTimeSpent());
            data.put("score", progress.getScore());
            data.put("maxScore", progress.getMaxScore());
            data.put("isPassed", progress.getIsPassed());
            data.put("totalItems", progress.getTotalItems());
            data.put("completedItems", progress.getCompletedItems());
            data.put("weightedScore", progress.getWeightedScore());
            data.put("totalWeightPercent", progress.getTotalWeightPercent());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }

    // ==================== CALCULATE ====================

    public Double calculatePercentage(Integer completedItems, Integer totalItems) {
        if (totalItems == null || totalItems == 0) return 0.0;
        int completed = completedItems != null ? completedItems : 0;
        return (double) completed / totalItems * 100;
    }
}