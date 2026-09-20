package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.response.ProgressResponse;
import org.xml.sax.ErrorHandler;

import java.math.BigDecimal;
import java.util.List;

public interface ProgressService {

    // ==================== COURSE PROGRESS ====================

    /** Lấy tiến độ tổng quan khóa học của học viên */
    ProgressResponse getCourseProgress(Integer accountId, Integer courseId);

    /** Lấy tất cả tiến độ khóa học của học viên */
    List<ProgressResponse> getProgressByAccount(Integer accountId);

    /** Lấy danh sách tiến độ của tất cả học viên trong 1 khóa học (Dành cho Admin/Giảng viên) */
    List<ProgressResponse> getProgressByCourse(Integer courseId);

    /** Khởi tạo hoặc lấy tiến độ khóa học khi học viên bắt đầu học */
    ProgressResponse startCourse(Integer accountId, Integer courseId);

    /** Tự động tính toán lại tiến độ tổng thể của khóa học (Completion/Weighted Grade) */
    ProgressResponse recalculateCourseProgress(Integer accountId, Integer courseId);

    /** Cập nhật tổng thời gian học tích lũy ở cấp khóa học */
    ProgressResponse updateCourseTimeSpent(Integer accountId, Integer courseId, Integer timeSpent);

    /** Đánh dấu hoàn thành khóa học thủ công (hoặc qua điều kiện đặc biệt) */
    ProgressResponse completeCourse(Integer accountId, Integer courseId);

    /** Cập nhật điểm trọng số tổng kết khóa học */
    ProgressResponse updateWeightedScore(Integer accountId, Integer courseId,
                                         BigDecimal score, BigDecimal weightPercent);

    // ==================== RESOURCE PROGRESS ====================

    /** Khởi tạo tiến độ cho 1 tài nguyên (Lesson/Video/Quiz) */
    ProgressResponse startResource(Integer accountId, Integer resourceId, Integer courseId);

    /** Overload: Khởi tạo tiến độ tài nguyên không cần truyền trước courseId */
    ProgressResponse startResource(Integer accountId, Integer resourceId);

    /** Lấy chi tiết tiến độ của 1 tài nguyên cụ thể */
    ProgressResponse getResourceProgress(Integer accountId, Integer resourceId);

    /** Lấy danh sách tiến độ tất cả tài nguyên trong khóa học của học viên */
    List<ProgressResponse> getResourceProgressByCourse(Integer accountId, Integer courseId);

    /** Cập nhật % hoàn thành tài nguyên (Có kiểm tra Anti-cheat cho Video) */
    ProgressResponse updateResourceProgress(Integer accountId, Integer resourceId, BigDecimal percentage);

    /** Cập nhật % hoàn thành kèm thời gian xem thực tế */
    ProgressResponse updateResourceProgress(Integer accountId, Integer resourceId, BigDecimal percentage, Integer timeSpent);

    /** Cập nhật thời gian học tích lũy cho tài nguyên */
    ProgressResponse updateResourceTimeSpent(Integer accountId, Integer resourceId, Integer timeSpent);

    /** Cập nhật điểm số tài nguyên (Lưu điểm cao nhất - Best Score) */
    ProgressResponse updateResourceScore(Integer accountId, Integer resourceId,
                                         BigDecimal score, BigDecimal maxScore, Boolean isPassed);

    /** Đánh dấu hoàn thành 1 tài nguyên */
    ProgressResponse completeResource(Integer accountId, Integer resourceId);

    // ==================== ATTEMPTS MANAGEMENT ====================

    /** Đồng bộ/Tăng số lần làm bài thi của học viên */
    ProgressResponse incrementResourceAttempt(Integer accountId, Integer resourceId);

    // ==================== RESET PROGRESS ====================

    /** Reset toàn bộ tiến độ khóa học về trạng thái ban đầu */
    void resetCourseProgress(Integer accountId, Integer courseId);

    /** Reset tiến độ của 1 bài học/bài thi cụ thể */
    void resetResourceProgress(Integer accountId, Integer resourceId);
    /**
     * [INSTRUCTOR / ADMIN] Lấy RESOURCE progress của 1 học viên cụ thể.
     * Current user lấy từ SecurityContext bên trong service.
     *
     * @param studentId   accountId của học viên muốn xem
     * @param courseId    course cần xem
     * @throws ErrorHandler 403 nếu không có quyền
     */
    List<ProgressResponse> getStudentResourceProgressForInstructor(
            Integer studentId,
            Integer courseId);
}