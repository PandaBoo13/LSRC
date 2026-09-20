package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.AccountPermission;
import org.wisdom.oc01.generic.IRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountPermissionRepository extends IRepository<AccountPermission, Integer> {

    // ✅ Thêm query mới với JOIN FETCH
    @Query("SELECT ap FROM AccountPermission ap JOIN FETCH ap.permission WHERE ap.account.idAccount = :accountId AND ap.isActive = true")
    List<AccountPermission> findByAccountIdAccountAndIsActiveTrueWithPermission(@Param("accountId") Integer accountId);

    // Lấy tất cả permissions của 1 account (cả active và inactive)
    List<AccountPermission> findByAccountIdAccount(Integer accountId);

    // Kiểm tra account có permission cụ thể không
    Optional<AccountPermission> findByAccountIdAccountAndPermissionIdPermission(
            Integer accountId, Integer permissionId);

    // Kiểm tra xem permission có đang active không
    boolean existsByAccountIdAccountAndPermissionIdPermissionAndIsActiveTrue(
            Integer accountId, Integer permissionId);

    // Vô hiệu hóa 1 permission của account (soft delete)
    @Modifying
    @Query("UPDATE AccountPermission ap SET ap.isActive = false " +
            "WHERE ap.account.idAccount = :accountId AND ap.permission.idPermission = :permissionId")
    void deactivatePermission(@Param("accountId") Integer accountId,
                              @Param("permissionId") Integer permissionId);

    // Kích hoạt lại permission
    @Modifying
    @Query("UPDATE AccountPermission ap SET ap.isActive = true " +
            "WHERE ap.account.idAccount = :accountId AND ap.permission.idPermission = :permissionId")
    void activatePermission(@Param("accountId") Integer accountId,
                            @Param("permissionId") Integer permissionId);

    // Xóa tất cả permissions của 1 account
    void deleteByAccountIdAccount(Integer accountId);
}