// ============================================
// LecturerProfileRepository.java - Repository
// ============================================
package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.LecturerProfile;

import java.util.Optional;

@Repository
public interface LecturerProfileRepository extends JpaRepository<LecturerProfile, Integer> {

    // ✅ Đã đổi từ user sang account
    Optional<LecturerProfile> findByAccountIdAccount(Integer accountId);

    boolean existsByAccountIdAccount(Integer accountId);

    Page<LecturerProfile> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT lp FROM LecturerProfile lp WHERE " +
            "(:keyword IS NULL OR LOWER(lp.expertise) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(lp.education) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<LecturerProfile> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT lp FROM LecturerProfile lp WHERE " +
            "(:specialty IS NULL OR lp.specialties LIKE CONCAT('%', :specialty, '%'))")
    Page<LecturerProfile> findBySpecialty(@Param("specialty") String specialty, Pageable pageable);

    Page<LecturerProfile> findByExperienceYearsGreaterThanEqual(Integer years, Pageable pageable);
}