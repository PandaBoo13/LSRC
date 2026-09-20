package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.OrderItem;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.entity.OrderItem.EnrollmentType;
import org.wisdom.oc01.repository.projection.StudentProgressProjection;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    // ==================== BASIC ====================
    List<OrderItem> findByOrderId(Integer orderId);

    Optional<OrderItem> findById(Integer id);

    // ==================== ACCOUNT ====================
    List<OrderItem> findByAccountIdAccount(Integer accountId);

    Page<OrderItem> findByAccountIdAccount(Integer accountId, Pageable pageable);

    List<OrderItem> findByAccountIdAccountAndStatus(Integer accountId, EnrollmentStatus status);

    List<OrderItem> findByAccountIdAccountAndEnrollmentType(Integer accountId, EnrollmentType enrollmentType);

    boolean existsByAccountIdAccountAndCourseIdCourse(Integer accountId, Integer courseId);

    List<OrderItem> findAllByAccountIdAccountAndCourseIdCourse(Integer accountId, Integer courseId);

    // ==================== ENROLLMENT VALIDATION ====================

    boolean existsByAccountIdAccountAndCourseIdCourseAndEnrollmentType(
            Integer accountId, Integer courseId, EnrollmentType enrollmentType);

    boolean existsByAccountIdAccountAndCourseIdCourseAndStatusIn(
            Integer accountId, Integer courseId, List<EnrollmentStatus> statuses);

    Optional<OrderItem> findTopByAccountIdAccountAndCourseIdCourseOrderByCreatedAtDesc(
            Integer accountId, Integer courseId);

    List<OrderItem> findByAccountIdAccountAndCourseIdCourseAndStatusIn(
            Integer accountId, Integer courseId, List<EnrollmentStatus> statuses);

    // ==================== COURSE ====================
    List<OrderItem> findByCourseIdCourse(Integer courseId);

    Page<OrderItem> findByCourseIdCourse(Integer courseId, Pageable pageable);

    Long countByCourseIdCourse(Integer courseId);

    Long countByCourseIdCourseAndStatus(Integer courseId, EnrollmentStatus status);

    Long countByCourseIdCourseAndEnrollmentType(Integer courseId, EnrollmentType enrollmentType);

    // ==================== STATUS ====================
    List<OrderItem> findByStatus(EnrollmentStatus status);

    List<OrderItem> findByEnrollmentType(EnrollmentType enrollmentType);

    // ==================== UPDATE ====================
    // ==================== UPDATE ====================

    @Modifying(flushAutomatically = true)
    @Query("UPDATE OrderItem oi SET oi.progress = :progress, oi.status = :status WHERE oi.id = :id")
    void updateProgress(@Param("id") Integer id,
                        @Param("progress") BigDecimal progress,
                        @Param("status") EnrollmentStatus status);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE OrderItem oi SET oi.status = :status WHERE oi.id = :id")
    void updateStatus(@Param("id") Integer id, @Param("status") EnrollmentStatus status);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE OrderItem oi SET oi.status = 'COMPLETED', oi.progress = 100, oi.completedAt = CURRENT_TIMESTAMP WHERE oi.id = :id")
    void markAsCompleted(@Param("id") Integer id);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE OrderItem oi SET oi.enrollmentType = 'ENROLLED' WHERE oi.id = :id")
    void activateEnrollment(@Param("id") Integer id);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE OrderItem oi SET oi.enrollmentType = 'ENROLLED' WHERE oi.course.idCourse = :courseId AND oi.enrollmentType = 'WAITING'")
    void activateAllWaitingForCourse(@Param("courseId") Integer courseId);

    // ==================== RESET PROGRESS ====================

    @Modifying(flushAutomatically = true)
    @Query("UPDATE OrderItem oi SET oi.progress = 0, oi.completedAt = null, oi.status = 'ACTIVE' " +
            "WHERE oi.account.idAccount = :accountId AND oi.course.idCourse = :courseId")
    void resetProgressByAccountAndCourse(@Param("accountId") Integer accountId,
                                         @Param("courseId") Integer courseId);

    // ==================== COMBINED ====================
    @Query("SELECT oi FROM OrderItem oi WHERE oi.course.idCourse = :courseId AND oi.status = 'ACTIVE'")
    List<OrderItem> findActiveStudentsByCourse(@Param("courseId") Integer courseId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.course.idCourse = :courseId AND oi.status = 'COMPLETED'")
    List<OrderItem> findCompletedStudentsByCourse(@Param("courseId") Integer courseId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.course.idCourse = :courseId AND oi.enrollmentType = 'WAITING'")
    List<OrderItem> findWaitingStudentsByCourse(@Param("courseId") Integer courseId);

    // ==================== STATISTICS ====================
    @Query("SELECT oi.status, COUNT(oi) FROM OrderItem oi WHERE oi.course.idCourse = :courseId GROUP BY oi.status")
    List<Object[]> getEnrollmentStatsByCourse(@Param("courseId") Integer courseId);

    @Query("SELECT oi.course.idCourse, COUNT(oi) as studentCount FROM OrderItem oi " +
            "WHERE oi.status IN ('ACTIVE', 'COMPLETED') " +
            "GROUP BY oi.course.idCourse ORDER BY studentCount DESC")
    List<Object[]> findTopCoursesByStudents(Pageable pageable);

    @Query("SELECT COALESCE(SUM(oi.finalPrice), 0) FROM OrderItem oi WHERE oi.course.idCourse = :courseId")
    BigDecimal calculateRevenueByCourse(@Param("courseId") Integer courseId);

    // ==================== ✅ PROJECTION (THAY THẾ Object[]) ====================

    /**
     * Lấy tiến độ học viên dùng Projection (thay vì Object[]).
     * Sử dụng alias camelCase để map vào interface.
     */
    @Query(value = "SELECT " +
            "a.id_account AS accountId, " +
            "a.username AS username, " +
            "COALESCE(p.status, 'NOT_STARTED') AS status, " +
            "COALESCE(p.progress_percentage, 0) AS progressPercentage, " +
            "COALESCE(p.completed_items, 0) AS completedItems, " +
            "COALESCE(p.total_items, 0) AS totalItems, " +
            "COALESCE(p.total_time_spent, 0) AS totalTimeSpent, " +
            "p.last_accessed_at AS lastAccessedAt, " +
            "p.completed_at AS completedAt, " +
            "p.started_at AS startedAt " +
            "FROM order_item oi " +
            "JOIN account a ON oi.account_id = a.id_account " +
            "LEFT JOIN progress p ON p.account_id = a.id_account " +
            "   AND p.course_id = oi.course_id " +
            "   AND p.progress_type = 'COURSE' " +
            "WHERE oi.course_id = :courseId " +
            "ORDER BY progressPercentage DESC, a.username ASC",
            nativeQuery = true)
    List<StudentProgressProjection> findStudentsWithProgressByCourse(@Param("courseId") Integer courseId);
}