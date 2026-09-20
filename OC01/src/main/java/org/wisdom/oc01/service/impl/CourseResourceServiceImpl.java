package org.wisdom.oc01.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.request.resource.CourseResourceRequest;
import org.wisdom.oc01.dto.response.CourseResourceResponse;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.entity.OrderItem.EnrollmentType;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.FileStorageService;
import org.wisdom.oc01.generic.mapper.CourseResourceMapper;
import org.wisdom.oc01.generic.validator.CourseResourceValidator;
import org.wisdom.oc01.repository.ChapterRepository;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.CourseResourceRepository;
import org.wisdom.oc01.repository.OrderItemRepository;
import org.wisdom.oc01.service.CourseResourceService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseResourceServiceImpl implements CourseResourceService {

    private final CourseResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final FileStorageService fileStorageService;
    private final CourseResourceMapper mapper;
    private final CourseResourceValidator validator;

    // ✅ FIXED [CRITICAL]: inject để check enrollment
    private final OrderItemRepository orderItemRepository;

    // ✅ FIXED [CRITICAL]: ObjectMapper dùng để sync settings.videoUrl
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== AUTHORIZATION HELPERS ====================

    private boolean isAdmin(Account account) {
        return account != null
                && account.getRole() != null
                && "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /**
     * Check user đã mua course chưa (order PAID + enrollment ENROLLED + ACTIVE).
     * Dùng cho các case student enrolled cần xem nội dung chưa PUBLISHED.
     */
    private boolean isEnrolled(Integer accountId, Integer courseId) {
        return orderItemRepository
                .findAllByAccountIdAccountAndCourseIdCourse(accountId, courseId)
                .stream()
                .anyMatch(item ->
                        item.getEnrollmentType() == EnrollmentType.ENROLLED
                                && item.getStatus() == EnrollmentStatus.ACTIVE
                                && item.getOrder() != null
                                && item.getOrder().getStatus() == Order.OrderStatus.PAID);
    }

    /**
     * MUTATION: đảm bảo current user là owner course hoặc admin.
     */
    private void assertCourseOwnership(Course course) {
        if (course == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
        }
        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return;

        if (course.getAccount() == null
                || !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thao tác trên khóa học này");
        }
    }

    /**
     * READ: kiểm tra current user được phép xem course không.
     *
     * Điều kiện:
     *  1. Course PUBLISHED → public (kể cả anonymous).
     *  2. Admin → OK.
     *  3. Owner course → OK.
     *  4. ✅ Student đã enroll → OK (dù course chưa PUBLISHED).
     *  5. Khác → 404.
     */
    private void assertCanReadCourse(Course course) {
        if (course == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
        }

        // 1. Public
        if (course.getStatus() == Course.CourseStatus.PUBLISHED) {
            return;
        }

        Account current = SecurityUtils.getCurrentAccount();
        if (current == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
        }

        // 2. Admin
        if (isAdmin(current)) return;

        // 3. Owner
        if (course.getAccount() != null
                && course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            return;
        }

        // 4. ✅ NEW: Enrolled student
        if (isEnrolled(current.getIdAccount(), course.getIdCourse())) {
            return;
        }

        // 5. Khác
        throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
    }

    /**
     * Load resource + enforce ownership cho MUTATION.
     */
    private CourseResource loadOwnedResource(Integer resourceId) {
        CourseResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Resource không tồn tại"));

        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return resource;

        Course course = resource.getCourse();
        if (course == null || course.getAccount() == null
                || !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại");
        }
        return resource;
    }

    /**
     * READ: kiểm tra current user được phép xem resource không.
     *
     * Điều kiện:
     *  1. Resource PUBLISHED + Course PUBLISHED → public.
     *  2. Admin → OK.
     *  3. Owner course → OK.
     *  4. ✅ Student đã enroll course PUBLISHED → OK (dù resource DRAFT/READY).
     *  5. Khác → 404.
     */
    private void assertCanReadResource(CourseResource resource) {
        // 1. Public
        boolean publicViewable = resource.getStatus() == CourseResource.Status.PUBLISHED
                && resource.getCourse() != null
                && resource.getCourse().getStatus() == Course.CourseStatus.PUBLISHED;
        if (publicViewable) return;

        Account current = SecurityUtils.getCurrentAccount();
        if (current == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại");
        }

        // 2. Admin
        if (isAdmin(current)) return;

        Course course = resource.getCourse();
        if (course == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại");
        }

        // 3. Owner course
        if (course.getAccount() != null
                && course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            return;
        }

        // 4. ✅ NEW: Enrolled student (course PUBLISHED)
        if (course.getStatus() == Course.CourseStatus.PUBLISHED
                && isEnrolled(current.getIdAccount(), course.getIdCourse())) {
            return;
        }

        // 5. Khác
        throw new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại");
    }

    // ==================== SYNC VIDEO URL ====================

    /**
     * FIXED [CRITICAL]: đồng bộ `settings.videoUrl` với `fileUrl`.
     */
    private void syncVideoUrlToSettings(CourseResource resource) {
        if (resource.getResourceType() != CourseResource.ResourceType.VIDEO) {
            return;
        }
        if (resource.getFileUrl() == null || resource.getFileUrl().isBlank()) {
            return;
        }

        try {
            Map<String, Object> settingsMap = new HashMap<>();
            String oldSettings = resource.getSettings();
            if (oldSettings != null && !oldSettings.isBlank()) {
                try {
                    settingsMap = objectMapper.readValue(
                            oldSettings,
                            new TypeReference<Map<String, Object>>() {}
                    );
                } catch (Exception e) {
                    log.warn("[SyncVideoUrl] Settings cũ bị lỗi JSON, tạo mới: {}",
                            e.getMessage());
                }
            }

            settingsMap.put("videoUrl", resource.getFileUrl());
            resource.setSettings(objectMapper.writeValueAsString(settingsMap));

            log.info("[SyncVideoUrl] Resource #{}: videoUrl → {}",
                    resource.getIdResource(), resource.getFileUrl());
        } catch (Exception e) {
            log.error("[SyncVideoUrl] Lỗi đồng bộ settings cho resource #{}: {}",
                    resource.getIdResource(), e.getMessage());
        }
    }

    // ==================== GET ====================

    @Override
    public List<CourseResourceResponse> getResourcesByCourse(Integer courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));

        assertCanReadCourse(course);

        return resourceRepository.findByCourseIdCourseOrderByOrderIndexAsc(courseId)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<CourseResourceResponse> getResourcesByChapter(Integer courseId,
                                                              Integer chapterId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));

        assertCanReadCourse(course);

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Chương không tồn tại"));
        if (!chapter.getCourse().getIdCourse().equals(courseId)) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Chương không tồn tại");
        }

        return resourceRepository
                .findByCourseIdCourseAndChapterIdChapterOrderByOrderIndexAsc(
                        courseId, chapterId)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<CourseResourceResponse> getResourcesByParent(Integer courseId,
                                                             Integer parentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));

        assertCanReadCourse(course);

        return resourceRepository
                .findByCourseIdCourseAndParentIdResourceOrderByOrderIndexAsc(
                        courseId, parentId)
                .stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public CourseResourceResponse getResourceById(Integer resourceId) {
        CourseResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Resource không tồn tại"));

        assertCanReadResource(resource);

        return mapper.toResponse(resource);
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public CourseResourceResponse uploadResource(Integer courseId,
                                                 CourseResourceRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));

        assertCourseOwnership(course);

        CourseResource resource = mapper.toEntity(request, courseId);

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                resource.setStatus(CourseResource.Status.valueOf(
                        request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Trạng thái không hợp lệ: " + request.getStatus());
            }
        }

        if (request.getFile() != null && !request.getFile().isEmpty()) {
            try {
                String fileName = fileStorageService.storeFile(
                        request.getFile(), "courses/resources");
                resource.setFileUrl("/uploads/" + fileName);
                resource.setFileName(request.getFile().getOriginalFilename());
                resource.setFileSize(request.getFile().getSize());
                resource.setFileFormat(getFileExtension(
                        request.getFile().getOriginalFilename()));
                resource.setMimeType(request.getFile().getContentType());

                if (resource.getStatus() == CourseResource.Status.DRAFT) {
                    resource.setStatus(CourseResource.Status.READY);
                }
            } catch (IOException e) {
                throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi upload file: " + e.getMessage());
            }
        }

        syncVideoUrlToSettings(resource);

        validator.validateForCreate(resource);
        resource = resourceRepository.save(resource);

        log.info("Resource #{} uploaded to course #{}: status={}, fileUrl={}",
                resource.getIdResource(), courseId,
                resource.getStatus(), resource.getFileUrl());
        return mapper.toResponse(resource);
    }

    @Override
    @Transactional
    public CourseResourceResponse addResourceByLink(Integer courseId,
                                                    CourseResourceRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));

        assertCourseOwnership(course);

        CourseResource resource = mapper.toEntity(request, courseId);
        resource.setFileUrl(request.getFileUrl());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                resource.setStatus(CourseResource.Status.valueOf(
                        request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Trạng thái không hợp lệ: " + request.getStatus());
            }
        } else {
            resource.setStatus(CourseResource.Status.READY);
        }

        syncVideoUrlToSettings(resource);

        validator.validateForCreate(resource);
        resource = resourceRepository.save(resource);
        return mapper.toResponse(resource);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public CourseResourceResponse updateResource(Integer resourceId,
                                                 CourseResourceRequest request) {
        CourseResource resource = loadOwnedResource(resourceId);

        mapper.updateEntity(resource, request);

        boolean hasNewFile = request.getFile() != null && !request.getFile().isEmpty();

        if (!hasNewFile
                && request.getStatus() != null
                && !request.getStatus().isBlank()) {
            try {
                CourseResource.Status newStatus = CourseResource.Status.valueOf(
                        request.getStatus().trim().toUpperCase());

                if (newStatus == CourseResource.Status.PUBLISHED) {
                    validator.validateForPublish(resource);
                }

                resource.setStatus(newStatus);
                log.info("[UpdateResource] Resource #{}: status → {}",
                        resourceId, newStatus);
            } catch (IllegalArgumentException e) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Trạng thái không hợp lệ: " + request.getStatus());
            }
        }

        if (hasNewFile) {
            try {
                String fileName = fileStorageService.storeFile(
                        request.getFile(), "courses/resources");
                resource.setFileUrl("/uploads/" + fileName);
                resource.setFileName(request.getFile().getOriginalFilename());
                resource.setFileSize(request.getFile().getSize());
                resource.setFileFormat(getFileExtension(
                        request.getFile().getOriginalFilename()));
                resource.setMimeType(request.getFile().getContentType());

                if (request.getStatus() == null || request.getStatus().isBlank()) {
                    resource.setStatus(CourseResource.Status.READY);
                }

                syncVideoUrlToSettings(resource);

                log.info("[UpdateResource] Resource #{}: new file → {}",
                        resourceId, resource.getFileUrl());
            } catch (IOException e) {
                throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi upload file: " + e.getMessage());
            }
        }

        validator.validateForUpdate(resource);
        resource = resourceRepository.save(resource);

        log.info("[UpdateResource] Resource #{} updated: status={}, fileUrl={}",
                resourceId, resource.getStatus(), resource.getFileUrl());
        return mapper.toResponse(resource);
    }

    @Override
    @Transactional
    public CourseResourceResponse updateResourceChapter(Integer resourceId,
                                                        Integer chapterId) {
        CourseResource resource = loadOwnedResource(resourceId);

        if (chapterId == null) {
            resource.setChapter(null);
        } else {
            Chapter chapter = chapterRepository.findById(chapterId)
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                            "Chương không tồn tại"));

            if (!chapter.getCourse().getIdCourse()
                    .equals(resource.getCourse().getIdCourse())) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Chương phải thuộc cùng khóa học với tài nguyên");
            }

            assertCourseOwnership(chapter.getCourse());
            resource.setChapter(chapter);
        }
        resource = resourceRepository.save(resource);
        return mapper.toResponse(resource);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void deleteResource(Integer resourceId) {
        CourseResource resource = loadOwnedResource(resourceId);

        if (resource.getFileUrl() != null) {
            fileStorageService.deleteFile(resource.getFileUrl());
        }
        resourceRepository.delete(resource);
        log.info("Resource #{} deleted", resourceId);
    }

    // ==================== STATUS ====================

    @Override
    @Transactional
    public CourseResourceResponse publishResource(Integer resourceId) {
        CourseResource resource = loadOwnedResource(resourceId);
        validator.validateForPublish(resource);
        resource.setStatus(CourseResource.Status.PUBLISHED);
        resource = resourceRepository.save(resource);
        return mapper.toResponse(resource);
    }

    @Override
    @Transactional
    public CourseResourceResponse unpublishResource(Integer resourceId) {
        CourseResource resource = loadOwnedResource(resourceId);
        resource.setStatus(CourseResource.Status.DRAFT);
        resource = resourceRepository.save(resource);
        return mapper.toResponse(resource);
    }

    // ==================== HELPER ====================

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return null;
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}