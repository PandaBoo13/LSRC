// ============================================
// OrderRepository.java
// ============================================
package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Order;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // ==================== EXISTING ====================
    Page<Order> findByAccountIdAccount(Integer accountId, Pageable pageable);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndAccountIdAccount(Integer id, Integer accountId);

    long countByAccountIdAccount(Integer accountId);

    // ==================== IDEMPOTENCY (VNPay / gateway callback) ====================

    /**
     * Check transaction_id đã được dùng cho order nào chưa.
     * Dùng để chặn callback trùng từ gateway (VNPay retry, attacker replay).
     *
     * FIXED [CRITICAL]: idempotency key cho payment callback.
     */
    boolean existsByTransactionId(String transactionId);

    /**
     * Tìm order theo transaction_id — dùng cho debug/tra cứu khi cần.
     */
    Optional<Order> findByTransactionId(String transactionId);
}