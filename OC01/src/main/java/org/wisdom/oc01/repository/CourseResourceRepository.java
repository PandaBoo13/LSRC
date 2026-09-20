// ============================================
// CourseResourceRepository.java - Repository
// ============================================
package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.CourseResource;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseResourceRepository extends JpaRepository<CourseResource, Integer> {

    // ==================== BASIC ====================

    List<CourseResource> findByCourseIdCourseOrderByOrderIndexAsc(Integer courseId);

    List<CourseResource> findByCourseIdCourseAndStatusOrderByOrderIndexAsc(Integer courseId, CourseResource.Status status);

    // ✅ Sửa: chapter.idChapter
    List<CourseResource> findByCourseIdCourseAndChapterIdChapterOrderByOrderIndexAsc(Integer courseId, Integer chapterId);

    // ✅ Sửa: parent.idResource
    List<CourseResource> findByCourseIdCourseAndParentIdResourceOrderByOrderIndexAsc(Integer courseId, Integer parentId);

    Optional<CourseResource> findByCourseIdCourseAndSlug(Integer courseId, String slug);

    List<CourseResource> findByCourseIdCourseAndResourceTypeOrderByOrderIndexAsc(Integer courseId, CourseResource.ResourceType resourceType);

    // ==================== COUNT ====================

    long countByCourseIdCourse(Integer courseId);

    long countByCourseIdCourseAndResourceType(Integer courseId, CourseResource.ResourceType resourceType);

    // ✅ Sửa: chapter.idChapter
    long countByCourseIdCourseAndChapterIdChapter(Integer courseId, Integer chapterId);

    // ==================== CHAPTER RESOURCES ====================

    @Query("SELECT cr FROM CourseResource cr WHERE cr.course.idCourse = :courseId AND cr.chapter IS NOT NULL ORDER BY cr.orderIndex ASC")
    List<CourseResource> findResourcesWithChapter(@Param("courseId") Integer courseId);

    // ==================== QUIZ WITHOUT WEIGHT ====================

    @Query("SELECT COUNT(cr) FROM CourseResource cr WHERE cr.course.idCourse = :courseId " +
            "AND cr.resourceType = org.wisdom.oc01.entity.CourseResource.ResourceType.QUIZ " +
            "AND cr.idResource NOT IN (SELECT qw.resource.idResource FROM QuizWeight qw WHERE qw.course.idCourse = :courseId)")
    Long countQuizzesWithoutWeight(@Param("courseId") Integer courseId);

    @Query("SELECT cr FROM CourseResource cr WHERE cr.course.idCourse = :courseId " +
            "AND cr.resourceType = org.wisdom.oc01.entity.CourseResource.ResourceType.QUIZ " +
            "AND cr.idResource NOT IN (SELECT qw.resource.idResource FROM QuizWeight qw WHERE qw.course.idCourse = :courseId)")
    List<CourseResource> findQuizzesWithoutWeight(@Param("courseId") Integer courseId);

    // ==================== VIDEO LESSONS ====================

    @Query("SELECT cr FROM CourseResource cr WHERE cr.course.idCourse = :courseId " +
            "AND cr.resourceType = org.wisdom.oc01.entity.CourseResource.ResourceType.VIDEO " +
            "ORDER BY cr.orderIndex ASC")
    List<CourseResource> findVideoLessonsByCourse(@Param("courseId") Integer courseId);

    @Query("SELECT COUNT(cr) FROM CourseResource cr WHERE cr.course.idCourse = :courseId " +
            "AND cr.resourceType = org.wisdom.oc01.entity.CourseResource.ResourceType.VIDEO")
    Long countVideoLessonsByCourse(@Param("courseId") Integer courseId);
}