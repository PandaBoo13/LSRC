// src/main/java/org/wisdom/oc01/generic/import_/RowParser.java
package org.wisdom.oc01.generic.import_;

/**
 * Chuyển 1 RowContext → entity T.
 * Trả về null = skip row (VD: row trống, row ghi chú).
 * Ném IllegalArgumentException nếu dữ liệu sai → engine sẽ bắt và thêm vào errors.
 */
@FunctionalInterface
public interface RowParser<T> {
    T parse(RowContext ctx);
}