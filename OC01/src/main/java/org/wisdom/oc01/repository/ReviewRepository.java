// ============================================
// ReviewRepository.java - Repository (Đã sửa)
// ============================================
package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Review;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // ✅ Đã đổi từ user sang account
    boolean existsByCourseIdCourseAndAccountIdAccount(Integer courseId, Integer accountId);

    Optional<Review> findByCourseIdCourseAndAccountIdAccount(Integer courseId, Integer accountId);

    Page<Review> findByCourseIdCourseOrderByCreatedAtDesc(Integer courseId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.course.idCourse = :courseId")
    Double getAverageRatingByCourseId(@Param("courseId") Integer courseId);

    Long countByCourseIdCourse(Integer courseId);

    // ✅ Đã đổi từ user sang account
    Page<Review> findByAccountIdAccountOrderByCreatedAtDesc(Integer accountId, Pageable pageable);
}