package org.wisdom.oc01.repository.quiz_assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.QuizAttempt;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Integer> {
    // ==================== BASIC QUERIES ====================
    List<QuizAttempt> findByResourceIdResourceAndAccountIdAccountOrderByAttemptNumberDesc(Integer resourceId, Integer accountId);
    Optional<QuizAttempt> findTopByResourceIdResourceAndAccountIdAccountOrderByAttemptNumberDesc(Integer resourceId, Integer accountId);
    List<QuizAttempt> findByCourseIdCourseAndAccountIdAccount(Integer courseId, Integer accountId);
    List<QuizAttempt> findByResourceIdResource(Integer resourceId);
    Long countByAccountIdAccountAndResourceIdResource(Integer accountId, Integer resourceId);
    List<QuizAttempt> findByAccountIdAccountAndResourceIdResource(Integer accountId, Integer resourceId);

    // ==================== COUNT PASSED ====================
    @Query("SELECT COUNT(DISTINCT qa.resource.idResource) FROM QuizAttempt qa WHERE qa.account.idAccount = :accountId AND qa.course.idCourse = :courseId AND qa.isPassed = true")
    Long countPassedQuizzesByAccountAndCourse(@Param("accountId") Integer accountId, @Param("courseId") Integer courseId);

    // Thêm điều kiện (qw.isCounted = true) để không bỏ sót Quiz bị disable trọng số
    @Query("SELECT COUNT(DISTINCT qa.resource.idResource) FROM QuizAttempt qa WHERE qa.account.idAccount = :accountId AND qa.course.idCourse = :courseId AND qa.isPassed = true AND qa.resource.idResource NOT IN (SELECT qw.resource.idResource FROM QuizWeight qw WHERE qw.course.idCourse = :courseId AND (qw.isCounted = true OR qw.isCounted IS NULL))")
    Long countPassedQuizzesWithoutWeight(@Param("accountId") Integer accountId, @Param("courseId") Integer courseId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.account.idAccount = :accountId AND qa.course.idCourse = :courseId AND qa.isPassed = true")
    List<QuizAttempt> findPassedQuizzesByAccountAndCourse(@Param("accountId") Integer accountId, @Param("courseId") Integer courseId);

    // Bổ sung lọc isPassed = true thống nhất để tính WEIGHTED_GRADE
    @Query("SELECT qa.resource.idResource, MAX(qa.score) FROM QuizAttempt qa WHERE qa.account.idAccount = :accountId AND qa.course.idCourse = :courseId AND qa.isPassed = true GROUP BY qa.resource.idResource")
    List<Object[]> findBestScoresByQuiz(@Param("accountId") Integer accountId, @Param("courseId") Integer courseId);

    // ==================== DELETE METHODS ====================
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM QuizAttempt qa WHERE qa.account.idAccount = :accountId AND qa.course.idCourse = :courseId")
    int deleteByAccountIdAccountAndCourseIdCourse(@Param("accountId") Integer accountId, @Param("courseId") Integer courseId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM QuizAttempt qa WHERE qa.account.idAccount = :accountId AND qa.resource.idResource = :resourceId")
    int deleteByAccountIdAccountAndResourceIdResource(@Param("accountId") Integer accountId, @Param("resourceId") Integer resourceId);
}