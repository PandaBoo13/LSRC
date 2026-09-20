package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Progress;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Integer> {

    // ==================== BASIC QUERIES ====================

    /** Override findById để eager-load account + course. */
    @Override
    @EntityGraph(attributePaths = {"account", "course"})
    Optional<Progress> findById(Integer id);

    @EntityGraph(attributePaths = {"account", "course"})
    Optional<Progress> findByAccountIdAccountAndCourseIdCourseAndProgressType(
            Integer accountId, Integer courseId, String progressType);

    @EntityGraph(attributePaths = {"account", "course"})
    Optional<Progress> findByAccountIdAccountAndReferenceIdAndProgressType(
            Integer accountId, Integer referenceId, String progressType);

    @EntityGraph(attributePaths = {"account", "course"})
    List<Progress> findByAccountIdAccount(Integer accountId);

    @EntityGraph(attributePaths = {"account", "course"})
    List<Progress> findByCourseIdCourseAndProgressType(Integer courseId, String progressType);

    @EntityGraph(attributePaths = {"account", "course"})
    List<Progress> findByAccountIdAccountAndCourseIdCourseAndProgressTypeAndReferenceIdIsNotNull(
            Integer accountId, Integer courseId, String progressType);

    boolean existsByAccountIdAccountAndCourseIdCourseAndProgressType(
            Integer accountId, Integer courseId, String progressType);

    boolean existsByAccountIdAccountAndCourseIdCourseAndProgressTypeAndReferenceId(
            Integer accountId, Integer courseId, String progressType, Integer referenceId);

    // ==================== STATUS QUERIES ====================

    Long countByAccountIdAccountAndCourseIdCourseAndProgressTypeAndStatus(
            Integer accountId, Integer courseId, String progressType, String status);

    @EntityGraph(attributePaths = {"account", "course"})
    List<Progress> findByAccountIdAccountAndCourseIdCourseAndProgressTypeAndStatus(
            Integer accountId, Integer courseId, String progressType, String status);

    Long countByAccountIdAccountAndCourseIdCourseAndProgressTypeAndStatusAndReferenceType(
            Integer accountId, Integer courseId, String progressType, String status, String referenceType);

    // ==================== SYNC QUERIES ====================

    @EntityGraph(attributePaths = {"account", "course"})
    List<Progress> findByProgressTypeAndStatusIn(String progressType, List<String> statuses);

    @EntityGraph(attributePaths = {"account", "course"})
    List<Progress> findByCourseIdCourseAndProgressTypeAndStatusIn(
            Integer courseId, String progressType, List<String> statuses);

    // ==================== DELETE QUERIES ====================

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM Progress p WHERE p.account.idAccount = :accountId " +
            "AND p.course.idCourse = :courseId AND p.progressType = 'RESOURCE'")
    int deleteResourceProgressByAccountAndCourse(@Param("accountId") Integer accountId,
                                                 @Param("courseId") Integer courseId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM Progress p WHERE p.account.idAccount = :accountId " +
            "AND p.course.idCourse = :courseId AND p.progressType = 'COURSE'")
    int deleteCourseProgressByAccountAndCourse(@Param("accountId") Integer accountId,
                                               @Param("courseId") Integer courseId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM Progress p WHERE p.account.idAccount = :accountId " +
            "AND p.referenceId = :referenceId AND p.progressType = :progressType")
    int deleteByAccountIdAccountAndReferenceIdAndProgressType(
            @Param("accountId") Integer accountId,
            @Param("referenceId") Integer referenceId,
            @Param("progressType") String progressType);

    // ==================== UPDATE QUERIES ====================

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Progress p SET " +
            "p.status = :status, " +
            "p.progressPercentage = :percentage, " +
            "p.completedAt = CASE WHEN :status = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE p.completedAt END, " +
            "p.startedAt = CASE WHEN p.startedAt IS NULL AND :status = 'IN_PROGRESS' THEN CURRENT_TIMESTAMP ELSE p.startedAt END, " +
            "p.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE p.id = :id")
    void updateProgress(@Param("id") Integer id,
                        @Param("percentage") BigDecimal percentage,
                        @Param("status") String status);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Progress p SET p.totalTimeSpent = p.totalTimeSpent + :timeSpent, " +
            "p.lastAccessedAt = CURRENT_TIMESTAMP, p.updatedAt = CURRENT_TIMESTAMP WHERE p.id = :id")
    void updateTimeSpent(@Param("id") Integer id, @Param("timeSpent") Integer timeSpent);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Progress p SET p.score = :score, p.maxScore = :maxScore, " +
            "p.isPassed = :isPassed, p.updatedAt = CURRENT_TIMESTAMP WHERE p.id = :id")
    void updateScore(@Param("id") Integer id,
                     @Param("score") BigDecimal score,
                     @Param("maxScore") BigDecimal maxScore,
                     @Param("isPassed") Boolean isPassed);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Progress p SET p.attempts = p.attempts + 1, " +
            "p.updatedAt = CURRENT_TIMESTAMP WHERE p.id = :id")
    void incrementAttempts(@Param("id") Integer id);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Progress p SET p.totalItems = :totalItems, p.completedItems = :completedItems, " +
            "p.progressPercentage = :percentage, " +
            "p.status = CASE WHEN :percentage >= 100 THEN 'COMPLETED' WHEN :percentage > 0 THEN 'IN_PROGRESS' ELSE 'NOT_STARTED' END, " +
            "p.completedAt = CASE WHEN :percentage >= 100 THEN CURRENT_TIMESTAMP ELSE p.completedAt END, " +
            "p.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE p.id = :id")
    void updateCourseProgress(@Param("id") Integer id,
                              @Param("totalItems") Integer totalItems,
                              @Param("completedItems") Integer completedItems,
                              @Param("percentage") BigDecimal percentage);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Progress p SET p.weightedScore = :weightedScore, " +
            "p.totalWeightPercent = :totalWeightPercent, " +
            "p.updatedAt = CURRENT_TIMESTAMP WHERE p.id = :id")
    void updateWeightedScore(@Param("id") Integer id,
                             @Param("weightedScore") BigDecimal weightedScore,
                             @Param("totalWeightPercent") BigDecimal totalWeightPercent);

    // ==================== STATISTICS ====================

    @Query("SELECT p.status, COUNT(p) FROM Progress p " +
            "WHERE p.course.idCourse = :courseId AND p.progressType = 'COURSE' GROUP BY p.status")
    List<Object[]> getProgressStatsByCourse(@Param("courseId") Integer courseId);

    @Query("SELECT AVG(p.progressPercentage) FROM Progress p " +
            "WHERE p.course.idCourse = :courseId AND p.progressType = 'COURSE'")
    Double getAverageProgressByCourse(@Param("courseId") Integer courseId);

    @Query("SELECT COUNT(p) FROM Progress p " +
            "WHERE p.course.idCourse = :courseId AND p.progressType = 'RESOURCE' AND p.status = 'COMPLETED'")
    Long countCompletedResourcesByCourse(@Param("courseId") Integer courseId);

    // ==================== CHECK EXISTENCE ====================

    boolean existsByAccountIdAccountAndCourseIdCourseAndProgressTypeAndReferenceIdAndReferenceType(
            Integer accountId, Integer courseId, String progressType,
            Integer referenceId, String referenceType);

    @EntityGraph(attributePaths = {"account", "course"})
    Optional<Progress> findByAccountIdAccountAndCourseIdCourseAndProgressTypeAndReferenceIdAndReferenceType(
            Integer accountId, Integer courseId, String progressType,
            Integer referenceId, String referenceType);
}