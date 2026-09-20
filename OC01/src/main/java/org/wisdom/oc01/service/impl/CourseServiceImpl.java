package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.request.CourseRequest;
import org.wisdom.oc01.dto.request.CourseSearchRequest;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.dto.response.CourseResponse;
import org.wisdom.oc01.dto.response.HomePageCourseResponse;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.FileStorageService;
import org.wisdom.oc01.generic.mapper.CourseMapper;
import org.wisdom.oc01.generic.validator.CourseValidator;
import org.wisdom.oc01.repository.*;
import org.wisdom.oc01.service.AuditLogService;
import org.wisdom.oc01.service.CourseService;
import org.wisdom.oc01.service.notification.NotificationService;
import org.wisdom.oc01.util.AuditLogHelper;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final ChapterRepository chapterRepository;
    private final AuditLogService auditLogService;
    private final AuditLogHelper auditLogHelper;
    private final FileStorageService fileStorageService;
    private final CourseValidator validator;
    private final CourseMapper mapper;
    private final NotificationService notificationService;

    // KHÔNG còn field generalService — dùng SecurityUtils static.

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    // ==================== CREATE ====================

    /**
     * Tạo khóa học mới.
     * FIXED [CRITICAL]: KHÔNG tin request.accountId.
     *  - User thường: luôn tạo course dưới chính mình.
     *  - Admin: có thể chỉ định accountId khác (ghi hộ).
     */
    @Override
    @Transactional
    public Course createCourse(CourseRequest request, Integer currentAccountId) {
        Account current = SecurityUtils.requireCurrentAccount();

        // Xác định account sở hữu khóa học
        Integer accountId;
        if (request.getAccountId() != null
                && !request.getAccountId().equals(current.getIdAccount())) {
            // Có yêu cầu account khác → CHỈ admin mới được
            if (!isAdmin(current)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN,
                        "Bạn không có quyền tạo khóa học cho tài khoản khác");
            }
            accountId = request.getAccountId();
        } else {
            // Mặc định: chính mình
            accountId = current.getIdAccount();
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        String slug = generateUniqueSlug(request.getTitle());
        String thumbnailUrl = uploadThumbnail(request);

        Course course = mapper.toEntity(request, account, slug, thumbnailUrl);
        validator.validateForCreate(
                course,
                courseRepository.existsByTitleAndAccountIdAccount(request.getTitle(), accountId));

        Course saved = courseRepository.save(course);
        log.info("✅ Khóa học đã tạo: ID={}, Title={}, Account={}",
                saved.getIdCourse(), saved.getTitle(), accountId);

        auditLogService.log(
                "COURSE", saved.getIdCourse(), "CREATE",
                "Tạo khóa học: \"" + saved.getTitle() + "\"",
                null, mapper.toJson(saved),
                current.getIdAccount(),
                auditLogHelper.getActorName(current.getIdAccount()),
                auditLogHelper.getActorRole(current.getIdAccount()),
                null);

        return saved;
    }

    // ==================== UPDATE ====================

    /** Cập nhật khóa học: kiểm tra quyền sở hữu/admin, sinh slug nếu đổi title, cập nhật thumbnail + audit log */
    @Override
    @Transactional
    public Course updateCourse(Integer id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));

        Account current = SecurityUtils.requireCurrentAccount();
        if (!isAdmin(current) && !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            log.warn("⚠️ [BẢO MẬT] Account {} không có quyền sửa khóa học {}",
                    current.getIdAccount(), id);
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền sửa khóa học này");
        }

        String oldValue = mapper.toJson(course);
        String oldTitle = course.getTitle();
        String slug = !oldTitle.equals(request.getTitle())
                ? generateUniqueSlug(request.getTitle())
                : course.getSlug();
        String thumbnailUrl = updateThumbnail(course, request);

        mapper.updateEntity(course, request, slug, thumbnailUrl);
        validator.validateForUpdate(
                course,
                !oldTitle.equals(request.getTitle())
                        && courseRepository.existsByTitleAndAccountIdAccount(
                        request.getTitle(), course.getAccount().getIdAccount()));

        Course updated = courseRepository.save(course);
        log.info("✅ Khóa học đã cập nhật: ID={}, Title={}", id, updated.getTitle());

        auditLogService.log(
                "COURSE", id, "UPDATE",
                "Cập nhật khóa học: \"" + oldTitle + "\"",
                oldValue, mapper.toJson(updated),
                current.getIdAccount(),
                auditLogHelper.getActorName(current.getIdAccount()),
                auditLogHelper.getActorRole(current.getIdAccount()),
                null);

        return updated;
    }

    // ==================== DELETE ====================

    /** Soft delete khóa học: kiểm tra quyền, xóa file thumbnail và set deletedAt */
    @Override
    @Transactional
    public void deleteCourse(Integer id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));

        Account current = SecurityUtils.requireCurrentAccount();
        if (!isAdmin(current) && !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            log.warn("⚠️ [BẢO MẬT] Account {} không có quyền xóa khóa học {}",
                    current.getIdAccount(), id);
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa khóa học này");
        }

        validator.validateForDelete(course);
        String oldValue = mapper.toJson(course);

        if (course.getThumbnailUrl() != null) {
            fileStorageService.deleteFileSafely(course.getThumbnailUrl());
        }

        course.setDeletedAt(LocalDateTime.now());
        courseRepository.save(course);
        log.info("✅ Khóa học đã xóa (soft delete): ID={}, Title={}", id, course.getTitle());

        auditLogService.log(
                "COURSE", id, "DELETE",
                "Xóa khóa học: \"" + course.getTitle() + "\"",
                oldValue, null,
                current.getIdAccount(),
                auditLogHelper.getActorName(current.getIdAccount()),
                auditLogHelper.getActorRole(current.getIdAccount()),
                null);
    }

    // ==================== GET ====================

    /** Lấy khóa học theo ID */
    @Override
    public CourseResponse getCourseById(Integer id) {
        return mapper.toResponse(findActiveCourse(id));
    }

    /** Lấy khóa học theo slug, loại trừ khóa học đã xóa */
    @Override
    public CourseResponse getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));
        if (course.getDeletedAt() != null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học đã bị xóa");
        }
        return mapper.toResponse(course);
    }

    /** Lấy danh sách khóa học có phân trang, hỗ trợ sort theo rating/students */
    @Override
    public Page<CourseResponse> getAllCourses(CourseSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Course> courses;

        if ("rating".equals(request.getSortBy())) {
            courses = courseRepository.findAllSortedByRating(pageable);
        } else if ("students".equals(request.getSortBy())) {
            courses = courseRepository.findAllSortedByStudents(pageable);
        } else {
            Sort sort = Sort.by(
                    request.getSortDirection() != null
                            ? request.getSortDirection() : Sort.Direction.DESC,
                    request.getSortBy() != null
                            ? request.getSortBy() : "createdAt");
            pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
            courses = courseRepository.findAll(buildSpec(request), pageable);
        }
        return courses.map(mapper::toResponse);
    }

    /**
     * Lấy khóa học theo instructor.
     * FIXED [HIGH]: user thường chỉ được xem course của chính mình; admin xem được của mọi instructor.
     */
    @Override
    public Page<CourseResponse> getCoursesByInstructor(Integer accountId, CourseSearchRequest request) {
        Account current = SecurityUtils.requireCurrentAccount();

        Integer targetAccountId = accountId;
        if (targetAccountId == null) {
            targetAccountId = current.getIdAccount();
        } else if (!isAdmin(current)
                && !targetAccountId.equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem khóa học của giảng viên khác");
        }

        if (!accountRepository.existsById(targetAccountId)) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại");
        }

        Sort sort = Sort.by(
                request.getSortDirection() != null
                        ? request.getSortDirection() : Sort.Direction.DESC,
                request.getSortBy() != null
                        ? request.getSortBy() : "createdAt");

        return courseRepository
                .findByAccountId(targetAccountId,
                        PageRequest.of(request.getPage(), request.getSize(), sort))
                .map(mapper::toResponse);
    }

    // ==================== STATUS ====================

    /** Đổi trạng thái khóa học: kiểm tra quyền, validate transition, gửi notification khi publish */
    @Override
    @Transactional
    public void updateStatus(Integer id, String status) {
        Course course = findActiveCourse(id);
        Account current = SecurityUtils.requireCurrentAccount();

        if (!isAdmin(current) && !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            log.warn("⚠️ [BẢO MẬT] Account {} không có quyền đổi trạng thái khóa học {}",
                    current.getIdAccount(), id);
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thay đổi trạng thái khóa học này");
        }

        Course.CourseStatus newStatus = validator.validateStatus(status);
        if (newStatus == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
        Course.CourseStatus oldStatus = course.getStatus();
        validator.validateStatusTransition(course, newStatus);

        course.setStatus(newStatus);

        if (newStatus == Course.CourseStatus.PUBLISHED) {
            course.setPublishedAt(LocalDateTime.now());
            course.setArchivedAt(null);

            notificationService.sendNotification(
                    NotificationRequest.builder()
                            .senderAccountId(current.getIdAccount())
                            .receiverRole("ALL_USERS")
                            .title("Khóa học mới")
                            .content("Khóa học \"" + course.getTitle() + "\" đã được xuất bản")
                            .referenceType("course")
                            .referenceId(course.getIdCourse())
                            .extraData(Map.of(
                                    "courseId", course.getIdCourse(),
                                    "courseSlug", course.getSlug(),
                                    "courseTitle", course.getTitle(),
                                    "thumbnailUrl", course.getThumbnailUrl() != null
                                            ? course.getThumbnailUrl() : ""
                            ))
                            .build());
        } else if (newStatus == Course.CourseStatus.ARCHIVED) {
            course.setArchivedAt(LocalDateTime.now());
        }

        courseRepository.save(course);
        log.info("✅ Trạng thái khóa học đã cập nhật: ID={}, {} → {}",
                id, oldStatus, newStatus);

        auditLogService.log(
                "COURSE", id, newStatus.name(),
                "Chuyển trạng thái \"" + course.getTitle() + "\": " + oldStatus + " → " + newStatus,
                "{\"status\":\"" + oldStatus + "\"}",
                "{\"status\":\"" + newStatus + "\"}",
                current.getIdAccount(),
                auditLogHelper.getActorName(current.getIdAccount()),
                auditLogHelper.getActorRole(current.getIdAccount()),
                null);
    }

    // ==================== CLONE ====================

    /**
     * Nhân bản khóa học: tạo bản sao course + clone chapters và resources.
     * FIXED [HIGH]: user thường chỉ được clone vào chính mình; admin clone được cho người khác.
     *              Đồng thời kiểm tra user có quyền đọc source course không.
     */
    @Override
    @Transactional
    public CourseResponse cloneCourse(Integer courseId, Integer accountId) {
        Account current = SecurityUtils.requireCurrentAccount();

        Integer targetAccountId;
        if (accountId != null && !accountId.equals(current.getIdAccount())) {
            if (!isAdmin(current)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN,
                        "Bạn không có quyền clone khóa học cho tài khoản khác");
            }
            targetAccountId = accountId;
        } else {
            targetAccountId = current.getIdAccount();
        }

        Account account = accountRepository.findById(targetAccountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));

        Course source = findActiveCourse(courseId);

        // Nếu không phải admin, chỉ được clone course của chính mình
        if (!isAdmin(current)
                && !source.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền clone khóa học này");
        }

        Course clone = mapper.cloneEntity(
                source, account,
                generateUniqueSlug("[Bản sao] " + source.getTitle()));

        validator.validate(clone);
        Course savedClone = courseRepository.save(clone);
        cloneChaptersAndResources(source, savedClone);

        log.info("✅ Khóa học đã nhân bản: {} → {}",
                source.getIdCourse(), savedClone.getIdCourse());

        return mapper.toResponse(savedClone);
    }

    // ==================== PREREQUISITE ====================

    /** Gán khóa học tiên quyết, kiểm tra quyền và validate không tự tham chiếu */
    @Override
    @Transactional
    public Course setPrerequisite(Integer courseId, Integer prerequisiteCourseId) {
        Course course = findActiveCourse(courseId);
        Account current = SecurityUtils.requireCurrentAccount();

        if (!isAdmin(current) && !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thay đổi prerequisite của khóa học này");
        }

        validator.validateSetPrerequisite(courseId, prerequisiteCourseId);
        Course prerequisite = findActiveCourse(prerequisiteCourseId);
        course.setPrerequisiteCourse(prerequisite);
        return courseRepository.save(course);
    }

    /** Gỡ bỏ khóa học tiên quyết */
    @Override
    @Transactional
    public Course removePrerequisite(Integer courseId) {
        Course course = findActiveCourse(courseId);
        Account current = SecurityUtils.requireCurrentAccount();

        if (!isAdmin(current) && !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thay đổi prerequisite của khóa học này");
        }

        course.setPrerequisiteCourse(null);
        return courseRepository.save(course);
    }

    /** Lấy khóa học tiên quyết */
    @Override
    public CourseResponse getPrerequisite(Integer courseId) {
        return mapper.toResponse(findActiveCourse(courseId));
    }

    // ==================== HOMEPAGE ====================

    /** Lấy dữ liệu trang chủ */
    @Override
    public HomePageCourseResponse getHomePageCourses() {
        Pageable top8 = PageRequest.of(0, 8);
        Pageable top4 = PageRequest.of(0, 4);

        return HomePageCourseResponse.builder()
                .newestCourses(courseRepository.findNewestCourses(top8)
                        .stream().map(mapper::toResponse).toList())
                .mostPopularCourses(courseRepository.findMostPopularCourses(top8)
                        .stream().map(mapper::toResponse).toList())
                .topRatedCourses(courseRepository.findTopRatedCourses(top8)
                        .stream().map(mapper::toResponse).toList())
                .freeCourses(courseRepository.findFreeCourses(top8)
                        .stream().map(mapper::toResponse).toList())
                .discountedCourses(courseRepository.findDiscountedCourses(top8)
                        .stream().map(mapper::toResponse).toList())
                .coursesByCategory(buildCategoryCourses(top4))
                .build();
    }

    // ==================== HELPER ====================

    /** Kiểm tra account có role ADMIN không */
    private boolean isAdmin(Account account) {
        if (account == null || account.getRole() == null) return false;
        return "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /** Tìm khóa học chưa bị xóa */
    private Course findActiveCourse(Integer id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));
        if (course.getDeletedAt() != null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học đã bị xóa");
        }
        return course;
    }

    /** Build Specification động cho tìm kiếm */
    private Specification<Course> buildSpec(CourseSearchRequest request) {
        Specification<Course> spec = (root, query, cb) -> cb.isNull(root.get("deletedAt"));

        if (request.getStatus() != null && !request.getStatus().isEmpty())
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), validator.validateStatus(request.getStatus())));

        if (request.getKeyword() != null && !request.getKeyword().isEmpty())
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")),
                            "%" + request.getKeyword().toLowerCase() + "%"));

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty())
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category").get("id"), request.getCategoryId()));

        if (request.getLevel() != null && !request.getLevel().isEmpty())
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("level"), validator.validateLevel(request.getLevel())));

        if (request.getIsFree() != null)
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("isFree"), request.getIsFree()));

        return spec;
    }

    /** Build danh sách course theo category */
    private List<HomePageCourseResponse.CategoryCourses> buildCategoryCourses(Pageable pageable) {
        List<HomePageCourseResponse.CategoryCourses> result = new ArrayList<>();
        for (Category category : categoryRepository.findByIsActiveTrue()) {
            if (category.getLevel() == 0) {
                List<CourseResponse> courses = courseRepository
                        .findByCategoryId(category.getId(), pageable)
                        .stream().map(mapper::toResponse).toList();
                if (!courses.isEmpty()) {
                    result.add(HomePageCourseResponse.CategoryCourses.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .categorySlug(category.getSlug())
                            .courses(courses)
                            .build());
                }
            }
        }
        return result;
    }

    /** Clone toàn bộ chapters và resources từ source sang target */
    private void cloneChaptersAndResources(Course source, Course target) {
        if (source.getChapters() != null) {
            for (Chapter sc : source.getChapters()) {
                Chapter cc = new Chapter();
                cc.setTitle(sc.getTitle());
                cc.setDescription(sc.getDescription());
                cc.setOrderIndex(sc.getOrderIndex());
                cc.setCourse(target);
                chapterRepository.save(cc);

                List<CourseResource> chapterResources = courseResourceRepository
                        .findByCourseIdCourseAndChapterIdChapterOrderByOrderIndexAsc(
                                source.getIdCourse(), sc.getIdChapter());
                for (CourseResource sr : chapterResources) {
                    courseResourceRepository.save(
                            mapper.cloneResource(sr, target, cc, null));
                }
            }
        }

        List<CourseResource> standaloneResources = courseResourceRepository
                .findByCourseIdCourseOrderByOrderIndexAsc(source.getIdCourse());
        for (CourseResource sr : standaloneResources) {
            if (sr.getChapter() == null && sr.getParent() == null) {
                courseResourceRepository.save(
                        mapper.cloneResource(sr, target, null, null));
            }
        }
    }

    // ==================== FILE HELPERS ====================

    private String uploadThumbnail(CourseRequest request) {
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            try {
                return fileStorageService.storeFileWithPrefix(
                        request.getThumbnail(),
                        fileStorageService.getCourseThumbnailPath());
            } catch (Exception e) {
                log.error("❌ Lỗi upload thumbnail: {}", e.getMessage(), e);
                throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi upload ảnh: " + e.getMessage());
            }
        }
        return request.getThumbnailUrl();
    }

    private String updateThumbnail(Course course, CourseRequest request) {
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            try {
                if (course.getThumbnailUrl() != null) {
                    fileStorageService.deleteFileSafely(course.getThumbnailUrl());
                }
                return fileStorageService.storeFileWithPrefix(
                        request.getThumbnail(),
                        fileStorageService.getCourseThumbnailPath());
            } catch (Exception e) {
                log.error("❌ Lỗi cập nhật thumbnail: {}", e.getMessage(), e);
                throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi upload ảnh: " + e.getMessage());
            }
        }
        return request.getThumbnailUrl() != null
                ? request.getThumbnailUrl()
                : course.getThumbnailUrl();
    }

    // ==================== SLUG HELPERS ====================

    private String toSlug(String input) {
        String noWhiteSpace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhiteSpace, Normalizer.Form.NFD);
        return NON_LATIN.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("-+", "-");
    }

    private String generateUniqueSlug(String title) {
        String base = toSlug(title);
        String slug = base;
        int c = 1;
        while (courseRepository.existsBySlug(slug)) {
            slug = base + "-" + c++;
        }
        return slug;
    }
}