// ============================================================
// PROGRESS VALIDATOR - KIỂM TRA DỮ LIỆU TIẾN ĐỘ
// ============================================================
package org.wisdom.oc01.generic.validator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.OrderItemRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ============================================================
 * PROGRESS VALIDATOR - KIỂM TRA DỮ LIỆU TIẾN ĐỘ
 * ============================================================
 * Chức năng:
 * - Validate enrollment (quyền truy cập khóa học)
 * - Validate thời hạn truy cập
 * - Validate dữ liệu Progress entity
 * - Validate % tiến độ, thời gian, điểm số
 * ============================================================
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProgressValidator {

    // ==================== DEPENDENCIES ====================
    private final OrderItemRepository orderItemRepository;
    private final CourseRepository courseRepository;

    // ==================== CONSTANTS ====================
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    // ==================== VALIDATE ENROLLMENT ====================

    /**
     * Validate enrollment: kiểm tra học viên có quyền truy cập khóa học không.
     * Kiểm tra trạng thái order item và thời hạn truy cập.
     */
    public void validateEnrollment(Integer accountId, Integer courseId) {
        OrderItem activeOrder = getActiveOrderOrThrow(accountId, courseId);
        validateOrderStatus(activeOrder);
        validateAccessPeriod(activeOrder);
    }

    // ==================== VALIDATE DỮ LIỆU PROGRESS ====================

    /**
     * Validate toàn bộ Progress entity.
     */
    public void validate(Progress progress) {
        validateAccount(progress);
        validateCourse(progress);
        validateProgressType(progress);
        validatePercentage(progress.getProgressPercentage());
        validateStatus(progress);
        validateTimeSpent(progress.getTotalTimeSpent());

        if ("COURSE".equals(progress.getProgressType())) {
            validateCourseProgress(progress);
        } else if ("RESOURCE".equals(progress.getProgressType())) {
            validateResourceProgress(progress);
        }
    }

    /**
     * Validate khi tạo mới Progress.
     */
    public void validateForCreate(Progress progress) {
        validate(progress);
        if (!"NOT_STARTED".equals(progress.getStatus())
                && !"IN_PROGRESS".equals(progress.getStatus())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Tiến độ mới phải ở trạng thái NOT_STARTED hoặc IN_PROGRESS");
        }
    }

    /**
     * Validate khi cập nhật Progress.
     */
    public void validateForUpdate(Progress progress) {
        validate(progress);
    }

    /**
     * Validate khi hoàn thành Progress.
     */
    public void validateForComplete(Progress progress) {
        if ("COMPLETED".equals(progress.getStatus())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Đã hoàn thành rồi");
        }
    }

    // ==================== VALIDATE SINGLE VALUE ====================

    /**
     * Validate % tiến độ nằm trong khoảng 0-100.
     * Nếu null → trả về 0.
     */
    public BigDecimal validatePercentage(BigDecimal percentage) {
        if (percentage == null) {
            return ZERO;
        }
        if (percentage.compareTo(ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiến độ không được âm");
        }
        if (percentage.compareTo(HUNDRED) > 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiến độ không được vượt quá 100%");
        }
        return percentage;
    }

    /**
     * Validate thời gian học không âm.
     * Nếu null → trả về 0.
     */
    public Integer validateTimeSpent(Integer timeSpent) {
        if (timeSpent == null) {
            return 0;
        }
        if (timeSpent < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Thời gian học không được âm");
        }
        return timeSpent;
    }

    /**
     * Validate điểm số không âm.
     * Nếu null → trả về 0.
     */
    public BigDecimal validateScore(BigDecimal score) {
        if (score == null) {
            return ZERO;
        }
        if (score.compareTo(ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm số không được âm");
        }
        return score;
    }

    /**
     * Validate max score không âm.
     * Nếu null → trả về 100.
     */
    public BigDecimal validateMaxScore(BigDecimal maxScore) {
        if (maxScore == null) {
            return HUNDRED;
        }
        if (maxScore.compareTo(ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm tối đa không được âm");
        }
        return maxScore;
    }

    /**
     * Validate course tồn tại.
     */
    public Course validateCourseExists(Integer courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));
    }

    // ==================== VALIDATE PROGRESS ENTITY ====================

    /**
     * Validate account không null.
     */
    private void validateAccount(Progress progress) {
        if (progress.getAccount() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Progress phải có account");
        }
    }

    /**
     * Validate course không null.
     */
    private void validateCourse(Progress progress) {
        if (progress.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Progress phải có khóa học");
        }
    }

    /**
     * Validate progress type không trống.
     */
    private void validateProgressType(Progress progress) {
        if (progress.getProgressType() == null || progress.getProgressType().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại progress không được để trống");
        }
    }

    /**
     * Validate status không trống.
     */
    private void validateStatus(Progress progress) {
        if (progress.getStatus() == null || progress.getStatus().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không được để trống");
        }
    }

    // ==================== VALIDATE COURSE PROGRESS ====================

    /**
     * Validate COURSE progress: không có referenceId/referenceType.
     * Kiểm tra total items, completed items, weighted score.
     */
    private void validateCourseProgress(Progress progress) {
        if (progress.getReferenceId() != null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Progress khóa học không có referenceId");
        }
        if (progress.getReferenceType() != null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Progress khóa học không có referenceType");
        }

        if (progress.getTotalItems() != null && progress.getTotalItems() < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tổng số items không được âm");
        }
        if (progress.getCompletedItems() != null && progress.getCompletedItems() < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Số items hoàn thành không được âm");
        }
        if (progress.getCompletedItems() != null && progress.getTotalItems() != null
                && progress.getCompletedItems() > progress.getTotalItems()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Số items hoàn thành không được lớn hơn tổng số items");
        }

        if (progress.getWeightedScore() != null
                && (progress.getWeightedScore().compareTo(ZERO) < 0
                || progress.getWeightedScore().compareTo(HUNDRED) > 0)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm trọng số phải từ 0 đến 100");
        }
    }

    // ==================== VALIDATE RESOURCE PROGRESS ====================

    /**
     * Validate RESOURCE progress: phải có referenceId/referenceType.
     * Kiểm tra score, max score, attempts.
     */
    private void validateResourceProgress(Progress progress) {
        if (progress.getReferenceId() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Progress tài nguyên phải có referenceId");
        }
        if (progress.getReferenceType() == null || progress.getReferenceType().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Progress tài nguyên phải có referenceType");
        }

        if (progress.getScore() != null && progress.getScore().compareTo(ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm số không được âm");
        }
        if (progress.getMaxScore() != null && progress.getMaxScore().compareTo(ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm tối đa không được âm");
        }
    }

    // ==================== VALIDATE ENROLLMENT PRIVATE ====================

    /**
     * Lấy order item active của học viên cho khóa học.
     * Throw lỗi nếu chưa đăng ký.
     */
    private OrderItem getActiveOrderOrThrow(Integer accountId, Integer courseId) {
        return orderItemRepository
                .findTopByAccountIdAccountAndCourseIdCourseOrderByCreatedAtDesc(accountId, courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký khóa học này"));
    }

    /**
     * Kiểm tra trạng thái order item phải là ACTIVE hoặc COMPLETED.
     */
    private void validateOrderStatus(OrderItem orderItem) {
        if (!EnrollmentStatus.ACTIVE.equals(orderItem.getStatus()) &&
                !EnrollmentStatus.COMPLETED.equals(orderItem.getStatus())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Thẻ đăng ký khóa học không ở trạng thái kích hoạt");
        }
    }

    /**
     * Kiểm tra thời hạn truy cập khóa học.
     * Lấy accessPeriod từ Course (qua OrderItem.course).
     */
    private void validateAccessPeriod(OrderItem orderItem) {
        Course course = orderItem.getCourse();
        if (course == null || course.getAccessPeriod() == null
                || "Lifetime".equalsIgnoreCase(course.getAccessPeriod())) {
            return;
        }

        LocalDateTime enrollmentDate = orderItem.getCreatedAt() != null
                ? orderItem.getCreatedAt()
                : LocalDateTime.now();
        LocalDateTime expirationDate = calculateExpirationDate(enrollmentDate, course.getAccessPeriod());

        if (LocalDateTime.now().isAfter(expirationDate)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Khóa học đã hết hạn truy cập vào ngày: " + expirationDate.toLocalDate());
        }
    }

    /**
     * Tính ngày hết hạn dựa trên accessPeriod.
     * Hỗ trợ: months, years, days.
     */
    private LocalDateTime calculateExpirationDate(LocalDateTime startDate, String accessPeriod) {
        if (accessPeriod == null) return startDate.plusYears(100);
        String period = accessPeriod.toLowerCase().trim();

        if (period.contains("month")) {
            int months = Integer.parseInt(period.replaceAll("[^0-9]", ""));
            return startDate.plusMonths(months);
        } else if (period.contains("year")) {
            int years = Integer.parseInt(period.replaceAll("[^0-9]", ""));
            return startDate.plusYears(years);
        } else if (period.contains("day")) {
            int days = Integer.parseInt(period.replaceAll("[^0-9]", ""));
            return startDate.plusDays(days);
        }
        return startDate.plusYears(1);
    }
}