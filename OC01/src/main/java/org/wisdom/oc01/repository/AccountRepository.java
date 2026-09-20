package org.wisdom.oc01.repository;

import org.springframework.data.domain.Pageable;                        // ✅ THÊM
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.generic.IRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends IRepository<Account, Integer> {

    // ==================== BASIC QUERIES ====================

    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // ==================== QUERIES WITH FETCH ====================

    @Query("SELECT a FROM Account a " +
            "JOIN FETCH a.role r " +
            "LEFT JOIN FETCH a.user u " +
            "WHERE a.username = :username")
    Optional<Account> findByUsernameWithDetails(@Param("username") String username);

    @Query("SELECT a FROM Account a JOIN FETCH a.role WHERE a.idAccount = :id")
    Optional<Account> findByIdWithRole(@Param("id") Integer id);

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.user LEFT JOIN FETCH a.role")
    List<Account> findAllWithDetails();

    @Query("SELECT a FROM Account a JOIN FETCH a.user WHERE a.role.roleName = 'TEACHER'")
    List<Account> findAllTeachers();

    List<Account> findByRole(Role role);

    @Query("SELECT a FROM Account a " +
            "LEFT JOIN FETCH a.accountPermissions ap " +
            "LEFT JOIN FETCH ap.permission p " +
            "WHERE a.idAccount = :id")
    Optional<Account> findByIdWithPermissions(@Param("id") Integer id);

    // ==================== QUERIES CHO CHAT ====================

    /**
     * Lấy tất cả TEACHERS trừ current user (cho chat contacts)
     */
    @Query("SELECT DISTINCT a FROM Account a " +
            "LEFT JOIN FETCH a.user " +
            "WHERE a.role.roleName = 'TEACHER' " +
            "AND a.idAccount != :currentId")
    List<Account> findAllTeachers(@Param("currentId") Integer currentId);

    /**
     * Lấy tất cả STUDENTS (cho chat contacts)
     */
    @Query("SELECT DISTINCT a FROM Account a " +
            "LEFT JOIN FETCH a.user " +
            "WHERE a.role.roleName = 'STUDENT'")
    List<Account> findAllStudents();

    /**
     * ✅ SEARCH USER CHO CHAT — Option A
     * Tìm user theo email / username / số điện thoại.
     * - Loại trừ chính mình
     * - LEFT JOIN user để search được phone
     * - Có phân trang (giới hạn 20 kết quả)
     * - DISTINCT để tránh duplicate
     */
    @Query("SELECT DISTINCT a FROM Account a " +
            "LEFT JOIN FETCH a.user u " +
            "WHERE a.idAccount <> :currentId " +
            "AND (" +
            "   LOWER(a.email) LIKE LOWER(CONCAT('%', :kw, '%')) " +
            "   OR LOWER(a.username) LIKE LOWER(CONCAT('%', :kw, '%')) " +
            "   OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :kw, '%')) " +
            ") " +
            "ORDER BY a.username ASC")
    List<Account> searchUsersForChat(
            @Param("kw") String keyword,
            @Param("currentId") Integer currentId,
            Pageable pageable);

    // ==================== QUERIES CHO NOTIFICATION ====================

    @Query("SELECT a.idAccount FROM Account a WHERE a.role.roleName = 'STUDENT'")
    List<Integer> findAllStudentAccountIds();

    @Query("SELECT a.idAccount FROM Account a WHERE a.role.roleName = 'TEACHER'")
    List<Integer> findAllTeacherAccountIds();

    @Query("SELECT a.idAccount FROM Account a")
    List<Integer> findAllActiveAccountIds();

    @Query("SELECT DISTINCT oi.account.idAccount FROM OrderItem oi " +
            "WHERE oi.course.idCourse = :courseId " +
            "AND oi.enrollmentType = 'ENROLLED'")
    List<Integer> findStudentIdsByCourseId(@Param("courseId") Integer courseId);

    @Query("SELECT c.account.idAccount FROM Course c WHERE c.idCourse = :courseId")
    Integer findTeacherIdByCourseId(@Param("courseId") Integer courseId);

    @Query("SELECT a.idAccount FROM Account a " +
            "WHERE a.role.roleName IN ('STUDENT', 'TEACHER')")
    List<Integer> findAllStudentAndTeacherAccountIds();

    // ==================== QUERIES CHO DASHBOARD/STATISTICS ====================

    @Query("SELECT COUNT(a) FROM Account a WHERE a.role.roleName = :roleName")
    Long countByRoleName(@Param("roleName") String roleName);

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.user WHERE a.role.roleName = :roleName")
    List<Account> findByRoleName(@Param("roleName") String roleName);

    /**
     * ⚠️ KHÔNG SỬA — giữ nguyên cho các caller cũ
     */
    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.user " +
            "WHERE (:keyword IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Account> searchAccounts(@Param("keyword") String keyword);

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.user WHERE a.idAccount IN :ids")
    List<Account> findByIdsWithUser(@Param("ids") List<Integer> ids);

    @Query("SELECT COUNT(a) > 0 FROM Account a WHERE a.idAccount = :accountId AND a.role.roleName = :roleName")
    boolean hasRole(@Param("accountId") Integer accountId, @Param("roleName") String roleName);
}