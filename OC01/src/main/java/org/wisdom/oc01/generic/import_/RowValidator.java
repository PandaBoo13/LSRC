// src/main/java/org/wisdom/oc01/generic/import_/RowValidator.java
package org.wisdom.oc01.generic.import_;

/**
 * Validate entity sau khi parse.
 * Ném IllegalArgumentException nếu không hợp lệ.
 * Có thể dùng để check business rule (VD: SINGLE_CHOICE chỉ 1 đáp án đúng).
 */
@FunctionalInterface
public interface RowValidator<T> {
    void validate(T entity, RowContext ctx);
}