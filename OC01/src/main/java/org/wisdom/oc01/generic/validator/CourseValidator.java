package org.wisdom.oc01.generic.validator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;

/**
 * ============================================================
 * COURSE VALIDATOR - KIỂM TRA DỮ LIỆU KHÓA HỌC
 * ============================================================
 * Chức năng:
 * - Validate dữ liệu khi tạo/cập nhật khóa học
 * - Kiểm tra quyền chuyển trạng thái
 * - Validate prerequisite
 * ============================================================
 */
@Slf4j
@Component
public class CourseValidator {

    // KHÔNG còn field generalService — dùng SecurityUtils static.

    // ==================== VALIDATE TỔNG HỢP ====================

    /** Validate toàn bộ dữ liệu khóa học */
    public void validate(Course course) {
        validateTitle(course.getTitle());
        validateSlug(course.getSlug());
        validateDescription(course.getDescription());
        validatePrice(course);
        validateAccount(course);
        validatePrerequisite(course);
        validateStatus(course);
    }

    /** Validate khi tạo mới khóa học */
    public void validateForCreate(Course course, boolean titleExists) {
        validate(course);
        if (titleExists) {
            throw new ErrorHandler(HttpStatus.CONFLICT,
                    "Bạn đã có khóa học với tiêu đề \"" + course.getTitle() + "\"");
        }
    }

    /** Validate khi cập nhật khóa học */
    public void validateForUpdate(Course course, boolean titleExists) {
        validate(course);
        if (course.getDeletedAt() != null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Không thể cập nhật khóa học đã bị xóa");
        }
        if (titleExists) {
            throw new ErrorHandler(HttpStatus.CONFLICT,
                    "Bạn đã có khóa học với tiêu đề \"" + course.getTitle() + "\"");
        }
    }

    /** Validate khi xóa khóa học */
    public void validateForDelete(Course course) {
        if (course.getDeletedAt() != null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Khóa học đã bị xóa trước đó");
        }
        if (course.getStatus() != Course.CourseStatus.DRAFT) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể xóa khóa học ở trạng thái nháp");
        }
    }

    // ==================== VALIDATE TRẠNG THÁI ====================

    /**
     * Kiểm tra quyền chuyển trạng thái
     * - Admin: được phép chuyển tự do
     * - Teacher: phải theo quy trình DRAFT → PENDING_REVIEW → PUBLISHED
     */
    public void validateStatusTransition(Course course, Course.CourseStatus newStatus) {
        Course.CourseStatus oldStatus = course.getStatus();

        // FIXED: dùng SecurityUtils.getCurrentAccount() (trả null nếu chưa login)
        //        thay cho generalService.getCurrentAccountOrNull().
        Account currentAccount = SecurityUtils.getCurrentAccount();

        // Admin → bỏ qua kiểm tra transition
        if (currentAccount != null && isAdmin(currentAccount)) {
            log.info("👑 Admin bỏ qua kiểm tra transition: {} → {}", oldStatus, newStatus);
            return;
        }

        if (oldStatus == Course.CourseStatus.ARCHIVED
                && newStatus != Course.CourseStatus.DRAFT) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Khóa học đã lưu trữ chỉ có thể chuyển về trạng thái nháp");
        }
        if (newStatus == Course.CourseStatus.PUBLISHED
                && oldStatus != Course.CourseStatus.PENDING_REVIEW) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể xuất bản khóa học đã được gửi kiểm duyệt");
        }
        if (newStatus == Course.CourseStatus.PENDING_REVIEW
                && oldStatus != Course.CourseStatus.DRAFT) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể gửi kiểm duyệt khóa học ở trạng thái nháp");
        }
    }

    /** Kiểm tra prerequisite */
    public void validateSetPrerequisite(Integer courseId, Integer prerequisiteCourseId) {
        if (prerequisiteCourseId.equals(courseId)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Không thể đặt chính mình làm khóa học tiên quyết");
        }
    }

    // ==================== VALIDATE ENUM ====================

    public Course.Level validateLevel(String level) {
        if (level == null) return null;
        try {
            return Course.Level.valueOf(level.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trình độ không hợp lệ");
        }
    }

    public Course.CourseType validateCourseType(String courseType) {
        if (courseType == null) return null;
        try {
            return Course.CourseType.valueOf(courseType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại khóa học không hợp lệ");
        }
    }

    public Course.ProgressType validateProgressType(String progressType) {
        if (progressType == null) return null;
        try {
            return Course.ProgressType.valueOf(progressType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Kiểu tiến độ không hợp lệ");
        }
    }

    public Course.CourseStatus validateStatus(String status) {
        if (status == null) return null;
        try {
            return Course.CourseStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
    }

    // ==================== VALIDATE PRIVATE ====================

    private void validateTitle(String title) {
        if (title == null || title.trim().isEmpty())
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề khóa học không được để trống");
        if (title.length() < 5)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề phải có ít nhất 5 ký tự");
        if (title.length() > 255)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề không được vượt quá 255 ký tự");
    }

    private void validateSlug(String slug) {
        if (slug == null || slug.trim().isEmpty())
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Slug không được để trống");
    }

    private void validateDescription(String description) {
        if (description != null && description.length() > 5000)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Mô tả không được vượt quá 5000 ký tự");
    }

    private void validatePrice(Course course) {
        if (Boolean.TRUE.equals(course.getIsFree())) {
            if (course.getPrice() != null
                    && course.getPrice().compareTo(BigDecimal.ZERO) != 0) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Khóa học miễn phí phải có giá = 0");
            }
        } else {
            if (course.getPrice() == null)
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Giá không được để trống");
            if (course.getPrice().compareTo(BigDecimal.ZERO) < 0)
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Giá không được âm");
            if (course.getOldPrice() != null
                    && course.getOldPrice().compareTo(course.getPrice()) < 0) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Giá gốc phải lớn hơn hoặc bằng giá bán");
            }
        }
    }

    private void validateAccount(Course course) {
        if (course.getAccount() == null)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Khóa học phải có giảng viên");
    }

    private void validatePrerequisite(Course course) {
        if (course.getPrerequisiteCourse() != null
                && course.getIdCourse() != null
                && course.getPrerequisiteCourse().getIdCourse().equals(course.getIdCourse())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Không thể đặt chính mình làm khóa học tiên quyết");
        }
    }

    private void validateStatus(Course course) {
        if (course.getStatus() == null)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không được để trống");
    }

    // ==================== HELPER ====================

    private boolean isAdmin(Account account) {
        if (account == null || account.getRole() == null) return false;
        return "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }
}