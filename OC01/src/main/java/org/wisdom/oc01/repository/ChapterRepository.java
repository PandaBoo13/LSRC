package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Chapter;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {

    List<Chapter> findByCourseIdCourseOrderByOrderIndexAsc(Integer courseId);

    Long countByCourseIdCourse(Integer courseId);

    Chapter findTopByCourseIdCourseOrderByOrderIndexDesc(Integer courseId);
}