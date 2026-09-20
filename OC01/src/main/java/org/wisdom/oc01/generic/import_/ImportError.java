// src/main/java/org/wisdom/oc01/generic/import_/ImportError.java
package org.wisdom.oc01.generic.import_;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportError {
    private int rowNumber;     // 1-based (Excel row number FE thấy)
    private String field;      // Cột bị lỗi (optional, VD: "questionType")
    private String message;    // Lý do lỗi
}