// ============================================
// ChapterMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.ChapterResponse;
import org.wisdom.oc01.dto.response.CourseResourceResponse;
import org.wisdom.oc01.entity.Chapter;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ChapterMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CourseResourceMapper resourceMapper; // ✅ Đổi LessonMapper → CourseResourceMapper

    public ChapterResponse toResponse(Chapter chapter) {
        return toResponse(chapter, false);
    }

    public ChapterResponse toResponse(Chapter chapter, boolean includeResources) {
        ChapterResponse.ChapterResponseBuilder builder = ChapterResponse.builder()
                .id(chapter.getIdChapter())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .courseId(chapter.getCourse() != null ? chapter.getCourse().getIdCourse() : null)
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt());

        // ✅ Đổi getLessons() → getResources()
        if (includeResources && chapter.getResources() != null) {
            List<CourseResourceResponse> resourceResponses = chapter.getResources().stream()
                    .map(resourceMapper::toResponse)
                    .collect(Collectors.toList());
            builder.resources(resourceResponses);
            builder.totalResources(chapter.getResources().size());
        }

        return builder.build();
    }

    public String toJson(Chapter chapter) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", chapter.getIdChapter());
            data.put("title", chapter.getTitle());
            data.put("description", chapter.getDescription());
            data.put("orderIndex", chapter.getOrderIndex());
            data.put("courseId", chapter.getCourse() != null ? chapter.getCourse().getIdCourse() : null);
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}