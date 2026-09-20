// src/main/java/org/wisdom/oc01/generic/import_/RowContext.java
package org.wisdom.oc01.generic.import_;

import lombok.Getter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;

/**
 * Bọc 1 row Excel + tiện ích đọc cell.
 * rowNumber = 1-based để FE hiển thị đúng như Excel (row 1 = header).
 */
@Getter
public class RowContext {

    private final int rowNumber;      // 1-based cho FE
    private final Row row;
    private final DataFormatter formatter;
    private final FormulaEvaluator evaluator;

    public RowContext(int rowNumber, Row row,
                      DataFormatter formatter, FormulaEvaluator evaluator) {
        this.rowNumber = rowNumber;
        this.row = row;
        this.formatter = formatter;
        this.evaluator = evaluator;
    }

    /** Đọc cell dạng String, null-safe, có xử lý formula. */
    public String getString(int colIdx) {
        if (row == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        try {
            return formatter.formatCellValue(cell, evaluator);
        } catch (Exception e) {
            return null;
        }
    }

    /** Đọc cell, trim, trả về empty string nếu null/blank. */
    public String getStringTrimmed(int colIdx) {
        String v = getString(colIdx);
        return v == null ? "" : v.trim();
    }

    /** Kiểm tra row có hoàn toàn trống không. */
    public boolean isEmpty() {
        if (row == null) return true;
        short last = row.getLastCellNum();
        if (last < 0) return true;
        for (int i = 0; i < last; i++) {
            String v = getString(i);
            if (v != null && !v.isBlank()) return false;
        }
        return true;
    }
}