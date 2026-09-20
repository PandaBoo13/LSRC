package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.generic.IRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends IRepository<Role, Integer> {

    Optional<Role> findByRoleName(String roleName);

    boolean existsByRoleName(String roleName);

    // THÊM PHƯƠNG THỨC NÀY - Cách 1: JPA method
    List<Role> findByAccounts_IdAccount(Integer accountId);

    // Hoặc Cách 2: Dùng @Query
    @Query("SELECT DISTINCT r FROM Role r JOIN r.accounts a WHERE a.idAccount = :accountId")
    List<Role> findRolesByAccountId(@Param("accountId") Integer accountId);

    // Lấy role kèm theo accounts
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.accounts WHERE r.idRole = :id")
    Optional<Role> findByIdWithAccounts(@Param("id") Integer id);
}