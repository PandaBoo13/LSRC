// ============================================
// WishlistRepository.java - Repository
// ============================================
package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Wishlist;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {

    // ==================== BASIC ====================

    List<Wishlist> findByAccountIdAccountOrderByAddedAtDesc(Integer accountId);

    Page<Wishlist> findByAccountIdAccount(Integer accountId, Pageable pageable);

    Optional<Wishlist> findByAccountIdAccountAndCourseIdCourse(Integer accountId, Integer courseId);

    boolean existsByAccountIdAccountAndCourseIdCourse(Integer accountId, Integer courseId);

    List<Wishlist> findByCourseIdCourse(Integer courseId);

    // ==================== COUNT ====================

    Long countByAccountIdAccount(Integer accountId);

    Long countByCourseIdCourse(Integer courseId);

    // ==================== DELETE ====================

    void deleteByAccountIdAccountAndCourseIdCourse(Integer accountId, Integer courseId);

    // ==================== JOIN QUERIES ====================

    @Query("SELECT w FROM Wishlist w JOIN FETCH w.course WHERE w.account.idAccount = :accountId " +
            "ORDER BY w.addedAt DESC")
    List<Wishlist> findByAccountWithCourse(@Param("accountId") Integer accountId);
}