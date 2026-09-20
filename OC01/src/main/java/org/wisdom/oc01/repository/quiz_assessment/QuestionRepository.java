// ============================================
// QuestionRepository.java - Repository (Thêm lesson queries + phân trang)
// ============================================
package org.wisdom.oc01.repository.quiz_assessment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.entity.Question.QuestionStatus;
import org.wisdom.oc01.entity.Question.QuestionType;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    // ==================== BASIC ====================
    List<Question> findByCourseIdCourse(Integer courseId);
    Page<Question> findByCourseIdCourse(Integer courseId, Pageable pageable);
    List<Question> findByCourseIdCourseAndStatus(Integer courseId, QuestionStatus status);

    // ==================== LESSON QUERIES ====================
    List<Question> findByLessonIdResource(Integer lessonId);
    Page<Question> findByLessonIdResource(Integer lessonId, Pageable pageable);
    List<Question> findByLessonIdResourceAndStatus(Integer lessonId, QuestionStatus status);
    Page<Question> findByLessonIdResourceAndStatus(Integer lessonId, QuestionStatus status, Pageable pageable);
    Long countByLessonIdResource(Integer lessonId);
    List<Question> findByLessonIdResourceIn(List<Integer> lessonIds);

    @Query(value = "SELECT * FROM question WHERE lesson_id IN :lessonIds AND status = 'ACTIVE' ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsByLessons(@Param("lessonIds") List<Integer> lessonIds, @Param("limit") Integer limit);

    // ==================== TYPE QUERIES ====================
    List<Question> findByCourseIdCourseAndQuestionType(Integer courseId, QuestionType questionType);
    List<Question> findByCourseIdCourseAndStatusAndQuestionType(Integer courseId, QuestionStatus status, QuestionType questionType);

    // ==================== RANDOM QUERIES ====================
    @Query(value = "SELECT * FROM question WHERE course_id = :courseId AND status = 'ACTIVE' ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsByCourse(@Param("courseId") Integer courseId, @Param("limit") Integer limit);

    @Query(value = "SELECT * FROM question WHERE course_id = :courseId AND status = 'ACTIVE' AND question_type = :questionType ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsByCourseAndType(@Param("courseId") Integer courseId, @Param("questionType") String questionType, @Param("limit") Integer limit);

    // ==================== COUNT ====================
    Long countByCourseIdCourse(Integer courseId);
    Long countByCourseIdCourseAndStatus(Integer courseId, QuestionStatus status);
    Long countByCourseIdCourseAndQuestionType(Integer courseId, QuestionType questionType);
}