package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.response.ProgressResponse;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.entity.Course.ProgressType;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.GeneralService;
import org.wisdom.oc01.generic.mapper.ProgressMapper;
import org.wisdom.oc01.generic.validator.ProgressValidator;
import org.wisdom.oc01.repository.*;
import org.wisdom.oc01.repository.quiz_assessment.QuizAttemptRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuizWeightRepository;
import org.wisdom.oc01.repository.projection.StudentProgressProjection;
import org.wisdom.oc01.service.CourseService;
import org.wisdom.oc01.service.ProgressService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Service quản lý tiến độ học tập. Xử lý COURSE progress và RESOURCE progress. Hỗ trợ 2 loại: COMPLETION_BASED và WEIGHTED_GRADE. */
@Slf4j @Service @RequiredArgsConstructor @Transactional(readOnly = true) public class ProgressServiceImpl implements ProgressService {
    private final ProgressRepository progressRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizWeightRepository quizWeightRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProgressMapper mapper;
    private final GeneralService generalService;
    private final ProgressValidator progressValidator;
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal DEFAULT_PASSING_SCORE = new BigDecimal("80.00");
    private static final double VIDEO_COMPLETION_THRESHOLD = 0.80;

    // ==================== COURSE PROGRESS ====================

    /** Lấy tiến độ khóa học của 1 học viên. Nếu chưa có → tự động tạo mới. */
    @Override
    public ProgressResponse getCourseProgress(Integer accountId, Integer courseId) {
        progressValidator.validateEnrollment(accountId, courseId);
        return mapper.toResponse(getOrCreateCourseProgress(accountId, courseId));
    }

    /** Lấy danh sách tiến độ tất cả khóa học của 1 học viên. */
    @Override
    public List<ProgressResponse> getProgressByAccount(Integer accountId) {
        return progressRepository.findByAccountIdAccount(accountId).stream().filter(p -> "COURSE".equals(p.getProgressType())).map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy tiến độ tất cả học viên trong 1 khóa học (dùng JPA Projection). */
    @Override
    public List<ProgressResponse> getProgressByCourse(Integer courseId) {
        List<StudentProgressProjection> results = orderItemRepository.findStudentsWithProgressByCourse(courseId);
        int defaultTotalItems = calculateDefaultTotalItems(courseId);
        return results.stream().map(row -> ProgressResponse.builder()
                .accountId(row.getAccountId())
                .username(row.getUsername())
                .courseId(courseId)
                .status(row.getStatus() != null ? row.getStatus() : "NOT_STARTED")
                .progressPercentage(row.getProgressPercentage() != null ? row.getProgressPercentage() : BigDecimal.ZERO)
                .completedItems(row.getCompletedItems() != null ? row.getCompletedItems() : 0)
                .totalItems(row.getTotalItems() != null && row.getTotalItems() > 0 ? row.getTotalItems() : defaultTotalItems)
                .totalTimeSpent(row.getTotalTimeSpent() != null ? row.getTotalTimeSpent() : 0)
                .lastAccessedAt(row.getLastAccessedAt())
                .completedAt(row.getCompletedAt())
                .startedAt(row.getStartedAt())
                .build()).collect(Collectors.toList());
    }

    /** Bắt đầu học khóa học. Tạo mới COURSE progress nếu chưa có. */
    @Override @Transactional
    public ProgressResponse startCourse(Integer accountId, Integer courseId) {
        progressValidator.validateEnrollment(accountId, courseId);
        return mapper.toResponse(getOrCreateCourseProgress(accountId, courseId));
    }

    /** Tính lại % hoàn thành của khóa học, cho phép giảm % nếu items bị xóa. */
    /** Tính lại % hoàn thành của khóa học, cho phép giảm % nếu items bị xóa. */
    @Override @Transactional
    public ProgressResponse recalculateCourseProgress(Integer accountId, Integer courseId) {
        Progress courseProgress = getOrCreateCourseProgress(accountId, courseId);
        Course course = progressValidator.validateCourseExists(courseId);
        List<CourseResource> allResources = courseResourceRepository.findByCourseIdCourseOrderByOrderIndexAsc(courseId);
        Map<Integer, Progress> progressMap = getResourceProgressMap(accountId, courseId);
        int totalItems = allResources.size();
        int completedItems = calculateCompletedItems(allResources, progressMap);
        int totalTimeSpent = calculateTotalTimeSpent(progressMap);
        if (ProgressType.WEIGHTED_GRADE.equals(course.getProgressType())) {
            applyWeightedGradeProgress(courseProgress, course, allResources, progressMap, accountId, courseId);
        } else {
            applyCompletionBasedProgress(courseProgress, totalItems, completedItems);
        }
        courseProgress.setTotalTimeSpent(totalTimeSpent);
        courseProgress.setLastAccessedAt(LocalDateTime.now());
        Progress saved = progressRepository.save(courseProgress);
        ProgressResponse response = mapper.toResponse(saved);
        syncOrderItemProgress(accountId, courseId, saved);
        return response;
    }

    /** Cộng dồn thời gian học vào COURSE progress. */
    @Override @Transactional
    public ProgressResponse updateCourseTimeSpent(Integer accountId, Integer courseId, Integer timeSpent) {
        progressValidator.validateEnrollment(accountId, courseId);
        Integer validTimeSpent = progressValidator.validateTimeSpent(timeSpent);
        Progress courseProgress = getOrCreateCourseProgress(accountId, courseId);
        if (validTimeSpent > 0) {
            courseProgress.setTotalTimeSpent((courseProgress.getTotalTimeSpent() != null ? courseProgress.getTotalTimeSpent() : 0) + validTimeSpent);
            courseProgress.setLastAccessedAt(LocalDateTime.now());
            courseProgress = progressRepository.save(courseProgress);
        }
        return mapper.toResponse(courseProgress);
    }

    /** Đánh dấu hoàn thành khóa học. */
    @Override @Transactional
    public ProgressResponse completeCourse(Integer accountId, Integer courseId) {
        progressValidator.validateEnrollment(accountId, courseId);
        Progress courseProgress = getOrCreateCourseProgress(accountId, courseId);
        courseProgress.setStatus("COMPLETED");
        courseProgress.setProgressPercentage(HUNDRED);
        if (courseProgress.getCompletedAt() == null) {
            courseProgress.setCompletedAt(LocalDateTime.now());
        }
        courseProgress.setLastAccessedAt(LocalDateTime.now());
        Progress saved = progressRepository.save(courseProgress);
        syncOrderItemProgress(accountId, courseId, saved);
        return mapper.toResponse(saved);
    }

    /** Cập nhật điểm trọng số (chưa triển khai). */
    @Override
    public ProgressResponse updateWeightedScore(Integer accountId, Integer courseId, BigDecimal score, BigDecimal weightPercent) {
        throw new UnsupportedOperationException("Chức năng cập nhật điểm trọng số chưa được triển khai");
    }

    // ==================== RESOURCE PROGRESS ====================

    /** Bắt đầu học resource (tự lấy courseId từ resource). */
    @Override @Transactional
    public ProgressResponse startResource(Integer accountId, Integer resourceId) {
        CourseResource resource = getResourceOrThrow(resourceId);
        return startResource(accountId, resourceId, resource.getCourse().getIdCourse());
    }

    /** Bắt đầu học resource với courseId chỉ định. */
    @Override @Transactional
    public ProgressResponse startResource(Integer accountId, Integer resourceId, Integer courseId) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, courseId);
        getOrCreateCourseProgress(accountId, courseId);
        return mapper.toResponse(getOrCreateResourceProgress(accountId, resourceId, resource.getCourse()));
    }

    /** Lấy tiến độ 1 resource. */
    @Override
    public ProgressResponse getResourceProgress(Integer accountId, Integer resourceId) {
        return mapper.toResponse(getResourceProgressOrThrow(accountId, resourceId));
    }

    /** Lấy tiến độ tất cả resources trong khóa học. */
    @Override
    public List<ProgressResponse> getResourceProgressByCourse(Integer accountId, Integer courseId) {
        progressValidator.validateEnrollment(accountId, courseId);
        return getResourceProgressMap(accountId, courseId).values().stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Cập nhật % tiến độ resource (không kèm thời gian). */
    @Override @Transactional
    public ProgressResponse updateResourceProgress(Integer accountId, Integer resourceId, BigDecimal percentage) {
        return updateResourceProgress(accountId, resourceId, percentage, 0);
    }

    /** Cập nhật % tiến độ + thời gian học resource, kèm anti-cheat video. */
    @Override @Transactional
    public ProgressResponse updateResourceProgress(Integer accountId, Integer resourceId, BigDecimal percentage, Integer timeSpent) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, resource.getCourse().getIdCourse());
        Progress progress = getOrCreateResourceProgress(accountId, resourceId, resource.getCourse());
        updateProgressWithTimeSpent(progress, progressValidator.validateTimeSpent(timeSpent));
        BigDecimal validPercentage = applyVideoAntiCheat(resource, progress, progressValidator.validatePercentage(percentage));
        updateProgressPercentage(progress, validPercentage);
        progress.setLastAccessedAt(LocalDateTime.now());
        progress = progressRepository.save(progress);
        recalculateCourseProgress(accountId, resource.getCourse().getIdCourse());
        return mapper.toResponse(progress);
    }

    /** Cộng dồn thời gian học resource. */
    @Override @Transactional
    public ProgressResponse updateResourceTimeSpent(Integer accountId, Integer resourceId, Integer timeSpent) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, resource.getCourse().getIdCourse());
        Progress progress = getOrCreateResourceProgress(accountId, resourceId, resource.getCourse());
        updateProgressWithTimeSpent(progress, progressValidator.validateTimeSpent(timeSpent));
        progress.setLastAccessedAt(LocalDateTime.now());
        progress = progressRepository.save(progress);
        recalculateCourseProgress(accountId, resource.getCourse().getIdCourse());
        return mapper.toResponse(progress);
    }

    /** Cập nhật điểm số resource (quiz). */
    @Override @Transactional
    public ProgressResponse updateResourceScore(Integer accountId, Integer resourceId, BigDecimal score, BigDecimal maxScore, Boolean isPassed) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, resource.getCourse().getIdCourse());
        Progress progress = getOrCreateResourceProgress(accountId, resourceId, resource.getCourse());
        updateBestScore(progress, progressValidator.validateScore(score), progressValidator.validateMaxScore(maxScore));
        boolean passed = determinePassedStatus(progress, resource, isPassed);
        progress.setIsPassed(passed);
        if (passed) {
            completeResourceProgress(progress);
        }
        syncResourceAttempts(progress, accountId, resourceId);
        progress.setLastAccessedAt(LocalDateTime.now());
        progress = progressRepository.save(progress);
        recalculateCourseProgress(accountId, resource.getCourse().getIdCourse());
        return mapper.toResponse(progress);
    }

    /** Đánh dấu hoàn thành resource, validate xem đủ 80% video với VIDEO. */
    @Override @Transactional
    public ProgressResponse completeResource(Integer accountId, Integer resourceId) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, resource.getCourse().getIdCourse());
        Progress progress = getOrCreateResourceProgress(accountId, resourceId, resource.getCourse());
        validateVideoCompletion(resource, progress);
        completeResourceProgress(progress);
        progress.setLastAccessedAt(LocalDateTime.now());
        progress = progressRepository.save(progress);
        recalculateCourseProgress(accountId, resource.getCourse().getIdCourse());
        return mapper.toResponse(progress);
    }

    // ==================== ATTEMPTS MANAGEMENT ====================

    /** Đồng bộ số lần thử từ quiz_attempt vào progress. */
    @Override @Transactional
    public ProgressResponse incrementResourceAttempt(Integer accountId, Integer resourceId) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, resource.getCourse().getIdCourse());
        Progress progress = getOrCreateResourceProgress(accountId, resourceId, resource.getCourse());
        syncResourceAttempts(progress, accountId, resourceId);
        progress.setLastAccessedAt(LocalDateTime.now());
        return mapper.toResponse(progressRepository.save(progress));
    }

    // ==================== RESET PROGRESS ====================

    /** Reset tiến độ 1 resource. */
    @Override @Transactional
    public void resetResourceProgress(Integer accountId, Integer resourceId) {
        CourseResource resource = getResourceOrThrow(resourceId);
        progressValidator.validateEnrollment(accountId, resource.getCourse().getIdCourse());
        quizAttemptRepository.deleteByAccountIdAccountAndResourceIdResource(accountId, resourceId);
        progressRepository.deleteByAccountIdAccountAndReferenceIdAndProgressType(accountId, resourceId, "RESOURCE");
        progressRepository.flush();
        recalculateCourseProgress(accountId, resource.getCourse().getIdCourse());
    }

    @Override
    public List<ProgressResponse> getStudentResourceProgressForInstructor(Integer studentId, Integer courseId) {
        Course coures= progressValidator.validateCourseExists((courseId));
        Account current = SecurityUtils.requireCurrentAccount();
        boolean isAdmin= current.getRole()!= null && "ADMIN".equalsIgnoreCase(current.getRole().getRoleName());
        boolean isOnwer = coures.getAccount()!= null && coures.getAccount().getIdAccount().equals(current.getIdAccount());
        if (!isAdmin && !isOnwer){
            throw new ErrorHandler(HttpStatus.FORBIDDEN,"Ban khong co quyen xem tien do cua hoc vien nay");
        }
        if (!accountRepository.existsById(studentId)){
            throw new ErrorHandler(HttpStatus.NOT_FOUND,"Hoc vien any khong toan tai");
        }
        progressValidator.validateEnrollment(studentId,courseId);
        return getResourceProgressList(studentId,courseId).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Reset toàn bộ tiến độ khóa học. */
    @Override @Transactional
    public void resetCourseProgress(Integer accountId, Integer courseId) {
        progressValidator.validateEnrollment(accountId, courseId);
        quizAttemptRepository.deleteByAccountIdAccountAndCourseIdCourse(accountId, courseId);
        progressRepository.deleteResourceProgressByAccountAndCourse(accountId, courseId);
        progressRepository.findByAccountIdAccountAndCourseIdCourseAndProgressType(accountId, courseId, "COURSE").ifPresent(this::resetCourseProgressEntity);
        orderItemRepository.resetProgressByAccountAndCourse(accountId, courseId);
        progressRepository.flush();
    }

    // ==================== HELPER METHODS ====================

    /** Lấy resource hoặc throw lỗi. */
    private CourseResource getResourceOrThrow(Integer resourceId) {
        return courseResourceRepository.findById(resourceId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Bài học không tồn tại"));
    }

    /** Lấy resource progress hoặc throw lỗi. */
    private Progress getResourceProgressOrThrow(Integer accountId, Integer resourceId) {
        return progressRepository.findByAccountIdAccountAndReferenceIdAndProgressType(accountId, resourceId, "RESOURCE").orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Chưa có tiến độ bài học này"));
    }

    /** Lấy COURSE progress hiện tại, nếu chưa có thì tạo mới (tránh race condition). */
    private Progress getOrCreateCourseProgress(Integer accountId, Integer courseId) {
        Optional<Progress> existing = progressRepository.findByAccountIdAccountAndCourseIdCourseAndProgressType(accountId, courseId, "COURSE");
        if (existing.isPresent()) {
            return existing.get();
        }
        return createCourseProgress(accountId, courseId);
    }

    /** Tạo mới COURSE progress, trả về progress hiện có nếu race condition. */
    private Progress createCourseProgress(Integer accountId, Integer courseId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
        Course course = progressValidator.validateCourseExists(courseId);
        Progress progress = Progress.builder()
                .account(account)
                .course(course)
                .progressType("COURSE")
                .status("IN_PROGRESS")
                .progressPercentage(BigDecimal.ZERO)
                .completedItems(0)
                .totalItems((int) courseResourceRepository.countByCourseIdCourse(courseId))
                .totalTimeSpent(0)
                .startedAt(LocalDateTime.now())
                .lastAccessedAt(LocalDateTime.now())
                .build();
        try {
            return progressRepository.save(progress);
        } catch (Exception e) {
            return progressRepository.findByAccountIdAccountAndCourseIdCourseAndProgressType(accountId, courseId, "COURSE").orElseThrow(() -> new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khởi tạo tiến độ khóa học"));
        }
    }

    /** Lấy RESOURCE progress hiện tại, nếu chưa có thì tạo mới (tránh race condition). */
    private Progress getOrCreateResourceProgress(Integer accountId, Integer resourceId, Course course) {
        Optional<Progress> existing = progressRepository.findByAccountIdAccountAndReferenceIdAndProgressType(accountId, resourceId, "RESOURCE");
        if (existing.isPresent()) {
            return existing.get();
        }
        return createResourceProgress(accountId, resourceId, course);
    }

    /** Tạo mới RESOURCE progress, trả về progress hiện có nếu race condition. */
    private Progress createResourceProgress(Integer accountId, Integer resourceId, Course course) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
        Progress progress = Progress.builder()
                .account(account)
                .course(course)
                .progressType("RESOURCE")
                .referenceId(resourceId)
                .referenceType("course_resource")
                .status("IN_PROGRESS")
                .progressPercentage(BigDecimal.ZERO)
                .totalTimeSpent(0)
                .attempts(0)
                .isPassed(false)
                .startedAt(LocalDateTime.now())
                .lastAccessedAt(LocalDateTime.now())
                .build();
        try {
            return progressRepository.save(progress);
        } catch (Exception e) {
            return progressRepository.findByAccountIdAccountAndReferenceIdAndProgressType(accountId, resourceId, "RESOURCE").orElseThrow(() -> new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khởi tạo tiến độ bài học"));
        }
    }

    /** Lấy Map (resourceId → Progress). */
    private Map<Integer, Progress> getResourceProgressMap(Integer accountId, Integer courseId) {
        return progressRepository.findByAccountIdAccountAndCourseIdCourseAndProgressTypeAndReferenceIdIsNotNull(accountId, courseId, "RESOURCE").stream().collect(Collectors.toMap(Progress::getReferenceId, Function.identity(), (p1, p2) -> p1));
    }

    /** Tính tổng items mặc định (video + quiz). */
    private int calculateDefaultTotalItems(Integer courseId) {
        return Math.toIntExact(courseResourceRepository.countVideoLessonsByCourse(courseId)) + Math.toIntExact(courseResourceRepository.countByCourseIdCourseAndResourceType(courseId, CourseResource.ResourceType.QUIZ));
    }

    /** Đếm số resources đã hoàn thành. */
    private int calculateCompletedItems(List<CourseResource> resources, Map<Integer, Progress> progressMap) {
        return (int) resources.stream().filter(res -> Optional.ofNullable(progressMap.get(res.getIdResource())).map(p -> "COMPLETED".equals(p.getStatus())).orElse(false)).count();
    }

    /** Tính tổng thời gian học. */
    private int calculateTotalTimeSpent(Map<Integer, Progress> progressMap) {
        return progressMap.values().stream().mapToInt(p -> p.getTotalTimeSpent() != null ? p.getTotalTimeSpent() : 0).sum();
    }

    /** Áp dụng logic COMPLETION_BASED, cho phép giảm % nếu items bị xóa. */
    private void applyCompletionBasedProgress(Progress courseProgress, int totalItems, int completedItems) {
        BigDecimal percentage = totalItems > 0 ? new BigDecimal(completedItems).multiply(HUNDRED).divide(new BigDecimal(totalItems), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        courseProgress.setCompletedItems(completedItems);
        courseProgress.setTotalItems(totalItems);
        courseProgress.setProgressPercentage(percentage);
        if (totalItems > 0 && completedItems >= totalItems) {
            completeResourceProgress(courseProgress);
        } else {
            courseProgress.setStatus("IN_PROGRESS");
            courseProgress.setCompletedAt(null);
        }
    }

    /** Áp dụng logic WEIGHTED_GRADE, kiểm tra weights rỗng trước khi tính. */
    private void applyWeightedGradeProgress(Progress courseProgress, Course course, List<CourseResource> allResources, Map<Integer, Progress> progressMap, Integer accountId, Integer courseId) {
        List<QuizWeight> weights = quizWeightRepository.findByCourseIdCourseOrderByCreatedAtAsc(courseId);
        // Nếu chưa cấu hình weights → không tính, giữ IN_PROGRESS
        if (weights.isEmpty()) {
            log.warn("Khóa học {} chưa cấu hình quiz_weight, không thể tính tiến độ WEIGHTED_GRADE", courseId);
            courseProgress.setProgressPercentage(BigDecimal.ZERO);
            courseProgress.setStatus("IN_PROGRESS");
            courseProgress.setCompletedAt(null);
            return;
        }
        Map<Integer, BigDecimal> bestScoresMap = getBestScoresMap(accountId, courseId);
        BigDecimal totalWeightedScore = BigDecimal.ZERO;
        BigDecimal totalWeightPercent = BigDecimal.ZERO;
        boolean allMandatoryQuizzesPassed = true;
        for (QuizWeight weight : weights) {
            totalWeightPercent = totalWeightPercent.add(weight.getWeightPercent());
            BigDecimal bestScore = bestScoresMap.getOrDefault(weight.getResource().getIdResource(), BigDecimal.ZERO);
            BigDecimal passingScore = weight.getResource().getPassingScore() != null ? weight.getResource().getPassingScore() : DEFAULT_PASSING_SCORE;
            if (bestScore.compareTo(passingScore) < 0) {
                allMandatoryQuizzesPassed = false;
            }
            totalWeightedScore = totalWeightedScore.add(bestScore.divide(HUNDRED, 4, RoundingMode.HALF_UP).multiply(weight.getWeightPercent()));
        }
        BigDecimal percentage = totalWeightPercent.compareTo(BigDecimal.ZERO) > 0 ? totalWeightedScore.divide(totalWeightPercent, 4, RoundingMode.HALF_UP).multiply(HUNDRED) : BigDecimal.ZERO;
        courseProgress.setWeightedScore(totalWeightedScore);
        courseProgress.setTotalWeightPercent(totalWeightPercent);
        courseProgress.setCompletedItems(calculateCompletedItems(allResources, progressMap));
        courseProgress.setTotalItems(allResources.size());
        courseProgress.setProgressPercentage(percentage.min(HUNDRED).setScale(2, RoundingMode.HALF_UP));
        if (allMandatoryQuizzesPassed) {
            completeResourceProgress(courseProgress);
        } else {
            courseProgress.setStatus("IN_PROGRESS");
            courseProgress.setCompletedAt(null);
        }
    }

    /** Lấy Map (quizId → best score). */
    private Map<Integer, BigDecimal> getBestScoresMap(Integer accountId, Integer courseId) {
        return quizAttemptRepository.findBestScoresByQuiz(accountId, courseId).stream().collect(Collectors.toMap(row -> (Integer) row[0], row -> row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO));
    }

    /** Đánh dấu progress hoàn thành. */
    private void completeResourceProgress(Progress progress) {
        progress.setStatus("COMPLETED");
        progress.setProgressPercentage(HUNDRED);
        if (progress.getCompletedAt() == null) {
            progress.setCompletedAt(LocalDateTime.now());
        }
    }

    /** Cộng thời gian học vào progress. */
    private void updateProgressWithTimeSpent(Progress progress, Integer timeSpent) {
        if (timeSpent > 0) {
            progress.setTotalTimeSpent((progress.getTotalTimeSpent() != null ? progress.getTotalTimeSpent() : 0) + timeSpent);
        }
    }

    /** Cập nhật % tiến độ (không cho phép tụt % trừ khi reset). */
    private void updateProgressPercentage(Progress progress, BigDecimal validPercentage) {
        if (progress.getProgressPercentage() == null || validPercentage.compareTo(progress.getProgressPercentage()) > 0) {
            progress.setProgressPercentage(validPercentage);
        }
        if (validPercentage.compareTo(HUNDRED) == 0) {
            completeResourceProgress(progress);
        } else if (!"COMPLETED".equals(progress.getStatus())) {
            progress.setStatus("IN_PROGRESS");
        }
    }

    /** Áp dụng anti-cheat video: nếu đủ 100% nhưng chưa xem đủ 80% → giới hạn % hiển thị. */
    private BigDecimal applyVideoAntiCheat(CourseResource resource, Progress progress, BigDecimal validPercentage) {
        if (!CourseResource.ResourceType.VIDEO.equals(resource.getResourceType())) {
            return validPercentage;
        }
        int durationInSeconds = resource.getDuration() != null ? resource.getDuration() : 0;
        int requiredTime = (int) (durationInSeconds * VIDEO_COMPLETION_THRESHOLD);
        int spent = progress.getTotalTimeSpent() != null ? progress.getTotalTimeSpent() : 0;
        if (validPercentage.compareTo(HUNDRED) >= 0 && durationInSeconds > 0 && spent < requiredTime) {
            log.warn("Cảnh báo tua video: Account={}, Resource={}, Spent={}s, Required={}s", progress.getAccount().getIdAccount(), resource.getIdResource(), spent, requiredTime);
            return new BigDecimal(spent).multiply(HUNDRED).divide(new BigDecimal(durationInSeconds), 2, RoundingMode.HALF_UP).min(new BigDecimal("99.00"));
        }
        return validPercentage;
    }

    /** Cập nhật best score. */
    private void updateBestScore(Progress progress, BigDecimal score, BigDecimal maxScore) {
        BigDecimal currentScore = progress.getScore() != null ? progress.getScore() : BigDecimal.ZERO;
        if (score.compareTo(currentScore) >= 0) {
            progress.setScore(score);
            progress.setMaxScore(maxScore);
        }
    }

    /** Xác định passed/failed. */
    private boolean determinePassedStatus(Progress progress, CourseResource resource, Boolean isPassed) {
        if (Boolean.TRUE.equals(isPassed)) {
            return true;
        }
        BigDecimal passingScore = resource.getPassingScore() != null ? resource.getPassingScore() : DEFAULT_PASSING_SCORE;
        return progress.getScore() != null && progress.getScore().compareTo(passingScore) >= 0;
    }

    /** Kiểm tra xem đã xem đủ 80% video chưa. Cho phép sai số 5s do độ trễ timer FE. */
    private void validateVideoCompletion(CourseResource resource, Progress progress) {
        if (!CourseResource.ResourceType.VIDEO.equals(resource.getResourceType())) {
            return;
        }
        int durationInSeconds = resource.getDuration() != null ? resource.getDuration() : 0;
        int requiredTime = (int) (durationInSeconds * VIDEO_COMPLETION_THRESHOLD);
        // Cho phép sai số 5s do timer FE gửi mỗi 30s
        int tolerance = 5;
        int effectiveRequired = Math.max(0, requiredTime - tolerance);
        int spent = progress.getTotalTimeSpent() != null ? progress.getTotalTimeSpent() : 0;
        if (spent < effectiveRequired) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, String.format("Bạn phải xem ít nhất 80%% thời lượng video (Đã xem: %ds/%ds)", spent, requiredTime));
        }
    }

    /** Đồng bộ số lần thử từ quiz_attempt. */
    private void syncResourceAttempts(Progress progress, Integer accountId, Integer resourceId) {
        Long actualAttempts = quizAttemptRepository.countByAccountIdAccountAndResourceIdResource(accountId, resourceId);
        progress.setAttempts(actualAttempts != null ? actualAttempts.intValue() : 0);
    }

    /** Reset COURSE progress entity. */
    private void resetCourseProgressEntity(Progress p) {
        p.setStatus("IN_PROGRESS");
        p.setProgressPercentage(BigDecimal.ZERO);
        p.setCompletedItems(0);
        p.setWeightedScore(BigDecimal.ZERO);
        p.setTotalTimeSpent(0);
        p.setCompletedAt(null);
        p.setLastAccessedAt(LocalDateTime.now());
        progressRepository.save(p);
    }

    /** Đồng bộ % tiến độ sang order_item. */
    private void syncOrderItemProgress(Integer accountId, Integer courseId, Progress saved) {
        orderItemRepository.findTopByAccountIdAccountAndCourseIdCourseOrderByCreatedAtDesc(accountId, courseId).ifPresent(oi -> {
            EnrollmentStatus newStatus = "COMPLETED".equals(saved.getStatus()) ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;
            orderItemRepository.updateProgress(oi.getId(), saved.getProgressPercentage(), newStatus);
        });
    }

    private List<Progress> getResourceProgressList(Integer accountId, Integer courseId){
        return progressRepository.findByAccountIdAccountAndCourseIdCourseAndProgressTypeAndReferenceIdIsNotNull(accountId,courseId,"RESOURCE");}

}