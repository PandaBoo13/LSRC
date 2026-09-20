// ============================================
// CourseMapper.java - FULL COMPLETE
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.request.CourseRequest;
import org.wisdom.oc01.dto.response.CourseResponse;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.*;
import org.wisdom.oc01.generic.validator.CourseValidator;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final AccountRepository accountRepository;
    private final CourseValidator validator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== REQUEST → ENTITY (CREATE) ====================
    public Course toEntity(CourseRequest request, Account account, String slug, String thumbnailUrl) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(slug);
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(thumbnailUrl);

        // ✅ THÊM BACKGROUND
        course.setBackgroundThumbnail(request.getBackgroundThumbnail());
        if (request.getBackgroundType() != null) {
            course.setBackgroundType(Course.BackgroundType.valueOf(request.getBackgroundType()));
        }

        course.setDuration(request.getDuration());
        course.setIsFree(request.getIsFree() != null ? request.getIsFree() : false);
        course.setHasCertificate(request.getHasCertificate() != null ? request.getHasCertificate() : false);
        course.setAccessPeriod(request.getAccessPeriod() != null ? request.getAccessPeriod() : "Lifetime");
        course.setOutcomes(request.getOutcomes());
        course.setAccount(account);
        course.setLanguage(request.getLanguage());
        course.setStatus(Course.CourseStatus.DRAFT);

        course.setLevel(validator.validateLevel(request.getLevel()));
        course.setCourseType(validator.validateCourseType(request.getCourseType()));
        course.setProgressType(validator.validateProgressType(request.getProgressType()));

        if (request.getPrerequisiteCourseId() != null) {
            course.setPrerequisiteCourse(courseRepository.findById(request.getPrerequisiteCourseId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học tiên quyết không tồn tại")));
        }

        setPrice(course, request);

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            course.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục không tồn tại")));
        }

        return course;
    }

    // ==================== REQUEST → ENTITY (UPDATE) ====================
    public void updateEntity(Course course, CourseRequest request, String slug, String thumbnailUrl) {
        course.setTitle(request.getTitle());
        course.setSlug(slug);
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(thumbnailUrl);

        // ✅ THÊM BACKGROUND
        if (request.getBackgroundThumbnail() != null) {
            course.setBackgroundThumbnail(request.getBackgroundThumbnail());
        }
        if (request.getBackgroundType() != null) {
            course.setBackgroundType(Course.BackgroundType.valueOf(request.getBackgroundType()));
        }

        course.setDuration(request.getDuration());
        course.setIsFree(request.getIsFree() != null ? request.getIsFree() : false);
        course.setHasCertificate(request.getHasCertificate() != null ? request.getHasCertificate() : false);
        course.setAccessPeriod(request.getAccessPeriod() != null ? request.getAccessPeriod() : "Lifetime");
        course.setOutcomes(request.getOutcomes());
        course.setLanguage(request.getLanguage());

        course.setLevel(validator.validateLevel(request.getLevel()));
        course.setCourseType(validator.validateCourseType(request.getCourseType()));
        course.setProgressType(validator.validateProgressType(request.getProgressType()));

        if (request.getAccountId() != null) {
            Account account = accountRepository.findById(request.getAccountId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
            course.setAccount(account);
        }

        if (request.getPrerequisiteCourseId() != null) {
            course.setPrerequisiteCourse(courseRepository.findById(request.getPrerequisiteCourseId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học tiên quyết không tồn tại")));
        } else {
            course.setPrerequisiteCourse(null);
        }

        setPrice(course, request);

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            course.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục không tồn tại")));
        } else {
            course.setCategory(null);
        }
    }

    // ==================== CLONE ====================
    public Course cloneEntity(Course source, Account account, String slug) {
        Course clone = new Course();
        clone.setTitle("[Bản sao] " + source.getTitle());
        clone.setSlug(slug);
        clone.setDescription(source.getDescription());
        clone.setThumbnailUrl(source.getThumbnailUrl());

        // ✅ THÊM BACKGROUND
        clone.setBackgroundThumbnail(source.getBackgroundThumbnail());
        clone.setBackgroundType(source.getBackgroundType());

        clone.setLevel(source.getLevel());
        clone.setLanguage(source.getLanguage());
        clone.setDuration(source.getDuration());
        clone.setPrice(source.getPrice());
        clone.setOldPrice(source.getOldPrice());
        clone.setIsFree(source.getIsFree());
        clone.setHasCertificate(source.getHasCertificate());
        clone.setAccessPeriod(source.getAccessPeriod());
        clone.setOutcomes(source.getOutcomes());
        clone.setCourseType(source.getCourseType());
        clone.setProgressType(source.getProgressType());
        clone.setAccount(account);
        clone.setCategory(source.getCategory());
        clone.setPrerequisiteCourse(source.getPrerequisiteCourse());
        clone.setStatus(Course.CourseStatus.DRAFT);
        return clone;
    }

    // ==================== ✅ CLONE RESOURCE ====================
    public CourseResource cloneResource(CourseResource source, Course course, Chapter chapter, CourseResource parent) {
        CourseResource resource = new CourseResource();
        resource.setCourse(course);
        resource.setChapter(chapter);
        resource.setParent(parent);
        resource.setResourceType(source.getResourceType());
        resource.setTitle(source.getTitle());
        resource.setSlug(source.getSlug() != null ? source.getSlug() + "-clone" : null);
        resource.setDescription(source.getDescription());
        resource.setOrderIndex(source.getOrderIndex());
        resource.setIsRequired(source.getIsRequired());
        resource.setStatus(CourseResource.Status.DRAFT);
        resource.setSettings(source.getSettings());
        resource.setDuration(source.getDuration());
        resource.setContent(source.getContent());
        resource.setIsFreePreview(source.getIsFreePreview());
        resource.setThumbnailUrl(source.getThumbnailUrl());
        resource.setFileName(source.getFileName());
        resource.setFileUrl(source.getFileUrl());
        resource.setFileSize(source.getFileSize());
        resource.setFileFormat(source.getFileFormat());
        resource.setMimeType(source.getMimeType());
        resource.setMaxAttempts(source.getMaxAttempts());
        resource.setPassingScore(source.getPassingScore());
        resource.setTimeLimit(source.getTimeLimit());
        resource.setShuffleQuestions(source.getShuffleQuestions());
        resource.setHashtagFilter(source.getHashtagFilter());
        resource.setTotalQuestions(source.getTotalQuestions());
        return resource;
    }

    // ==================== ENTITY → RESPONSE ====================
    public CourseResponse toResponse(Course course) {
        CourseResponse.PrerequisiteInfo prerequisiteInfo = null;
        if (course.getPrerequisiteCourse() != null) {
            Course p = course.getPrerequisiteCourse();
            prerequisiteInfo = CourseResponse.PrerequisiteInfo.builder()
                    .id(p.getIdCourse())
                    .title(p.getTitle())
                    .slug(p.getSlug())
                    .isRequired(true)
                    .build();
        }

        Account account = course.getAccount();
        return CourseResponse.builder()
                .id(course.getIdCourse())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())

                // ✅ THÊM BACKGROUND
                .backgroundThumbnail(course.getBackgroundThumbnail())
                .backgroundType(course.getBackgroundType() != null ? course.getBackgroundType().name() : null)

                .level(course.getLevel() != null ? course.getLevel().name() : null)
                .duration(course.getDuration())
                .price(course.getPrice())
                .oldPrice(course.getOldPrice())
                .isFree(course.getIsFree())
                .hasCertificate(course.getHasCertificate())
                .accessPeriod(course.getAccessPeriod())
                .outcomes(course.getOutcomes())
                .status(course.getStatus().name())
                .publishedAt(course.getPublishedAt())
                .courseType(course.getCourseType() != null ? course.getCourseType().name() : "SELF_PACED")
                .language(course.getLanguage())
                .progressType(course.getProgressType() != null ? course.getProgressType().name() : "COMPLETION_BASED")
                .instructor(CourseResponse.InstructorInfo.builder()
                        .id(account.getIdAccount())
                        .firstName(account.getUser() != null ? account.getUser().getFirstName() : "")
                        .lastName(account.getUser() != null ? account.getUser().getLastName() : "")
                        .build())
                .category(course.getCategory() != null ? CourseResponse.CategoryInfo.builder()
                        .id(course.getCategory().getId())
                        .name(course.getCategory().getName())
                        .slug(course.getCategory().getSlug())
                        .build() : null)
                .prerequisite(prerequisiteInfo)
                .totalStudents(orderItemRepository.countByCourseIdCourse(course.getIdCourse()))
                .totalLessons(courseResourceRepository.countByCourseIdCourseAndResourceType(
                        course.getIdCourse(), CourseResource.ResourceType.VIDEO))
                .averageRating(reviewRepository.getAverageRatingByCourseId(course.getIdCourse()))
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    // ==================== ENTITY → JSON ====================
    public String toJson(Course course) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("title", course.getTitle());
            data.put("description", course.getDescription());
            data.put("level", course.getLevel() != null ? course.getLevel().name() : null);
            data.put("duration", course.getDuration());
            data.put("price", course.getPrice());
            data.put("oldPrice", course.getOldPrice());
            data.put("isFree", course.getIsFree());
            data.put("hasCertificate", course.getHasCertificate());
            data.put("accessPeriod", course.getAccessPeriod());
            data.put("language", course.getLanguage());
            data.put("courseType", course.getCourseType() != null ? course.getCourseType().name() : null);
            data.put("progressType", course.getProgressType() != null ? course.getProgressType().name() : null);
            data.put("status", course.getStatus().name());
            data.put("accountId", course.getAccount() != null ? course.getAccount().getIdAccount() : null);
            data.put("prerequisiteCourseId", course.getPrerequisiteCourse() != null ? course.getPrerequisiteCourse().getIdCourse() : null);

            // ✅ THÊM BACKGROUND
            data.put("backgroundThumbnail", course.getBackgroundThumbnail());
            data.put("backgroundType", course.getBackgroundType() != null ? course.getBackgroundType().name() : null);

            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }

    // ==================== HELPER ====================
    private void setPrice(Course course, CourseRequest request) {
        if (Boolean.TRUE.equals(course.getIsFree())) {
            course.setPrice(BigDecimal.ZERO);
            course.setOldPrice(null);
        } else {
            course.setPrice(request.getPrice());
            course.setOldPrice(request.getOldPrice());
        }
    }
}