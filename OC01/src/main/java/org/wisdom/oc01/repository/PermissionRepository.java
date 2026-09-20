package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Permission;
import org.wisdom.oc01.generic.IRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends IRepository<Permission, Integer> {

    Optional<Permission> findByPermissionName(String permissionName);

    boolean existsByPermissionName(String permissionName);

    List<Permission> findByResource(String resource);

    List<Permission> findByResourceAndAction(String resource, String action);

    // Lấy permissions của 1 account (trực tiếp từ account_permission)
    @Query("SELECT p FROM Permission p " +
            "JOIN p.accountPermissions ap " +
            "WHERE ap.account.idAccount = :accountId AND ap.isActive = true")
    List<Permission> findByAccountId(@Param("accountId") Integer accountId);

    // Lấy permissions của 1 account (bao gồm cả permission mặc định)
    @Query("SELECT DISTINCT p FROM Permission p " +
            "LEFT JOIN p.accountPermissions ap " +
            "WHERE (ap.account.idAccount = :accountId AND ap.isActive = true) " +
            "OR p.isDefault = true")
    List<Permission> findAllByAccountIdWithDefault(@Param("accountId") Integer accountId);

    // Lấy permissions mặc định
    List<Permission> findByIsDefaultTrue();
}