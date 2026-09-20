// ============================================
// CourseResourceMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.request.resource.CourseResourceRequest;
import org.wisdom.oc01.dto.response.CourseResourceResponse;
import org.wisdom.oc01.entity.Chapter;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.CourseResource;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.ChapterRepository;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.CourseResourceRepository;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CourseResourceMapper {

    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== REQUEST → ENTITY (CREATE) ====================

    public CourseResource toEntity(CourseResourceRequest request, Integer courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));

        CourseResource resource = new CourseResource();
        resource.setCourse(course);
        resource.setResourceType(CourseResource.ResourceType.valueOf(request.getResourceType().toUpperCase()));
        resource.setTitle(request.getTitle());
        resource.setSlug(request.getSlug() != null ? request.getSlug() : toSlug(request.getTitle()));
        resource.setDescription(request.getDescription());
        resource.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0);
        resource.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
        resource.setStatus(CourseResource.Status.DRAFT);
        resource.setSettings(request.getSettings());

        // Set chapter
        if (request.getChapterId() != null) {
            Chapter chapter = chapterRepository.findById(request.getChapterId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Chương không tồn tại"));
            resource.setChapter(chapter);
        }

        // Set parent (nếu resource là file thuộc lesson)
        if (request.getParentId() != null) {
            CourseResource parent = courseResourceRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Resource cha không tồn tại"));
            resource.setParent(parent);
        }

        // Video/File fields
        resource.setDuration(request.getDuration());
        resource.setContent(request.getContent());
        resource.setIsFreePreview(request.getIsFreePreview() != null ? request.getIsFreePreview() : false);
        resource.setThumbnailUrl(request.getThumbnailUrl());
        resource.setFileName(request.getFileName());
        resource.setFileUrl(request.getFileUrl());
        resource.setFileSize(request.getFileSize());
        resource.setFileFormat(request.getFileFormat());
        resource.setMimeType(request.getMimeType());

        // Quiz fields
        resource.setMaxAttempts(request.getMaxAttempts());
        resource.setPassingScore(request.getPassingScore());
        resource.setTimeLimit(request.getTimeLimit());
        resource.setShuffleQuestions(request.getShuffleQuestions() != null ? request.getShuffleQuestions() : false);
        resource.setHashtagFilter(request.getHashtagFilter());
        resource.setTotalQuestions(request.getTotalQuestions());

        return resource;
    }

    // ==================== REQUEST → ENTITY (UPDATE) ====================

    public void updateEntity(CourseResource resource, CourseResourceRequest request) {
        // ✅ NEW: Update resourceType nếu request có
        if (request.getResourceType() != null && !request.getResourceType().trim().isEmpty()) {
            try {
                resource.setResourceType(
                        CourseResource.ResourceType.valueOf(request.getResourceType().toUpperCase())
                );
            } catch (IllegalArgumentException e) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Loại tài nguyên không hợp lệ: " + request.getResourceType());
            }
        }

        if (request.getTitle() != null) resource.setTitle(request.getTitle());
        if (request.getDescription() != null) resource.setDescription(request.getDescription());
        if (request.getOrderIndex() != null) resource.setOrderIndex(request.getOrderIndex());
        if (request.getIsRequired() != null) resource.setIsRequired(request.getIsRequired());
        if (request.getSettings() != null) resource.setSettings(request.getSettings());

        if (request.getChapterId() != null) {
            Chapter chapter = chapterRepository.findById(request.getChapterId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Chương không tồn tại"));
            resource.setChapter(chapter);
        }

        if (request.getParentId() != null) {
            CourseResource parent = courseResourceRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Resource cha không tồn tại"));
            resource.setParent(parent);
        }

        // Video/File fields
        if (request.getDuration() != null) resource.setDuration(request.getDuration());
        if (request.getContent() != null) resource.setContent(request.getContent());
        if (request.getIsFreePreview() != null) resource.setIsFreePreview(request.getIsFreePreview());
        if (request.getThumbnailUrl() != null) resource.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getFileName() != null) resource.setFileName(request.getFileName());
        if (request.getFileUrl() != null) resource.setFileUrl(request.getFileUrl());
        if (request.getFileSize() != null) resource.setFileSize(request.getFileSize());
        if (request.getFileFormat() != null) resource.setFileFormat(request.getFileFormat());
        if (request.getMimeType() != null) resource.setMimeType(request.getMimeType());

        // Quiz fields
        if (request.getMaxAttempts() != null) resource.setMaxAttempts(request.getMaxAttempts());
        if (request.getPassingScore() != null) resource.setPassingScore(request.getPassingScore());
        if (request.getTimeLimit() != null) resource.setTimeLimit(request.getTimeLimit());
        if (request.getShuffleQuestions() != null) resource.setShuffleQuestions(request.getShuffleQuestions());
        if (request.getHashtagFilter() != null) resource.setHashtagFilter(request.getHashtagFilter());
        if (request.getTotalQuestions() != null) resource.setTotalQuestions(request.getTotalQuestions());
    }

    // ==================== ENTITY → RESPONSE ====================

    public CourseResourceResponse toResponse(CourseResource resource) {
        return CourseResourceResponse.builder()
                .id(resource.getIdResource())
                .courseId(resource.getCourse() != null ? resource.getCourse().getIdCourse() : null)
                .chapterId(resource.getChapter() != null ? resource.getChapter().getIdChapter() : null)
                .parentId(resource.getParent() != null ? resource.getParent().getIdResource() : null)
                .resourceType(resource.getResourceType().name())
                .title(resource.getTitle())
                .slug(resource.getSlug())
                .description(resource.getDescription())
                .orderIndex(resource.getOrderIndex())
                .isRequired(resource.getIsRequired())
                .status(resource.getStatus().name())
                .settings(resource.getSettings())
                .duration(resource.getDuration())
                .content(resource.getContent())
                .isFreePreview(resource.getIsFreePreview())
                .thumbnailUrl(resource.getThumbnailUrl())
                .fileName(resource.getFileName())
                .fileUrl(resource.getFileUrl())
                .fileSize(resource.getFileSize())
                .fileFormat(resource.getFileFormat())
                .mimeType(resource.getMimeType())
                .maxAttempts(resource.getMaxAttempts())
                .passingScore(resource.getPassingScore())
                .timeLimit(resource.getTimeLimit())
                .shuffleQuestions(resource.getShuffleQuestions())
                .hashtagFilter(resource.getHashtagFilter())
                .totalQuestions(resource.getTotalQuestions())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    // ==================== ENTITY → JSON ====================

    public String toJson(CourseResource resource) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", resource.getIdResource());
            data.put("courseId", resource.getCourse() != null ? resource.getCourse().getIdCourse() : null);
            data.put("chapterId", resource.getChapter() != null ? resource.getChapter().getIdChapter() : null);
            data.put("parentId", resource.getParent() != null ? resource.getParent().getIdResource() : null);
            data.put("resourceType", resource.getResourceType() != null ? resource.getResourceType().name() : null);
            data.put("title", resource.getTitle());
            data.put("slug", resource.getSlug());
            data.put("description", resource.getDescription());
            data.put("orderIndex", resource.getOrderIndex());
            data.put("isRequired", resource.getIsRequired());
            data.put("status", resource.getStatus() != null ? resource.getStatus().name() : null);
            data.put("duration", resource.getDuration());
            data.put("isFreePreview", resource.getIsFreePreview());
            data.put("fileName", resource.getFileName());
            data.put("fileUrl", resource.getFileUrl());
            data.put("maxAttempts", resource.getMaxAttempts());
            data.put("passingScore", resource.getPassingScore());
            data.put("timeLimit", resource.getTimeLimit());
            data.put("shuffleQuestions", resource.getShuffleQuestions());
            data.put("hashtagFilter", resource.getHashtagFilter());
            data.put("totalQuestions", resource.getTotalQuestions());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }

    // ==================== HELPER ====================

    private String toSlug(String input) {
        if (input == null) return null;
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}