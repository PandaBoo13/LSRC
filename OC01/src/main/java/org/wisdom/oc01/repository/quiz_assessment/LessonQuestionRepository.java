// ============================================
// LessonQuestionRepository.java - Repository
// ============================================
package org.wisdom.oc01.repository.quiz_assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.LessonQuestion;
import java.util.List;

@Repository
public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, Integer> {
    // Lấy tất cả câu hỏi của 1 resource (lesson/quiz)
    List<LessonQuestion> findByResourceIdResourceOrderByOrderIndexAsc(Integer resourceId);

    // Lấy tất cả câu hỏi của 1 question (xem question thuộc resource nào)
    List<LessonQuestion> findByQuestionIdQuestion(Integer questionId);

    // Kiểm tra question đã được gán vào resource chưa
    boolean existsByResourceIdResourceAndQuestionIdQuestion(Integer resourceId, Integer questionId);

    // Xóa tất cả câu hỏi của 1 resource
    void deleteByResourceIdResource(Integer resourceId);

    // Lấy câu hỏi theo resource (JOIN question)
    @Query("SELECT q FROM Question q JOIN LessonQuestion lq ON q.idQuestion = lq.question.idQuestion WHERE lq.resource.idResource = :resourceId ORDER BY lq.orderIndex ASC")
    List<org.wisdom.oc01.entity.Question> findQuestionsByResource(@Param("resourceId") Integer resourceId);

    // Đếm số câu hỏi của resource
    Long countByResourceIdResource(Integer resourceId);
}