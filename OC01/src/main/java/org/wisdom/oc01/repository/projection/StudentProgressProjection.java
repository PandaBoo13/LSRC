// ============================================================
// StudentProgressProjection.java
// ============================================================
package org.wisdom.oc01.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Interface Projection - Chỉ lấy các cột cần thiết cho tiến độ học viên.
 * KHÔNG cần lấy toàn bộ entity Account, Course, Progress.
 */
public interface StudentProgressProjection {

    /** Lấy accountId từ cột account_id */
    Integer getAccountId();

    /** Lấy username từ cột username */
    String getUsername();

    /** Lấy status từ cột status */
    String getStatus();

    /** Lấy progressPercentage từ cột progress_percentage */
    BigDecimal getProgressPercentage();

    /** Lấy completedItems từ cột completed_items */
    Integer getCompletedItems();

    /** Lấy totalItems từ cột total_items */
    Integer getTotalItems();

    /** Lấy totalTimeSpent từ cột total_time_spent */
    Integer getTotalTimeSpent();

    /** Lấy lastAccessedAt từ cột last_accessed_at */
    LocalDateTime getLastAccessedAt();

    /** Lấy completedAt từ cột completed_at */
    LocalDateTime getCompletedAt();

    /** Lấy startedAt từ cột started_at */
    LocalDateTime getStartedAt();
}