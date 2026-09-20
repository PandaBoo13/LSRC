package org.wisdom.oc01.repository.quiz_assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.QuizWeight;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizWeightRepository extends JpaRepository<QuizWeight, Integer> {
    List<QuizWeight> findByCourseIdCourseOrderByCreatedAtAsc(Integer courseId);
    Optional<QuizWeight> findByCourseIdCourseAndResourceIdResource(Integer courseId, Integer resourceId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    void deleteByResourceIdResource(Integer resourceId);
}