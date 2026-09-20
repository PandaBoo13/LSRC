// ============================================
// LecturerCertificateRepository.java
// ============================================
package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.LecturerCertificate;

import java.util.List;

@Repository
public interface LecturerCertificateRepository extends JpaRepository<LecturerCertificate, Integer> {

    List<LecturerCertificate> findByLecturerProfileId(Integer profileId);

    void deleteByLecturerProfileId(Integer profileId);
}