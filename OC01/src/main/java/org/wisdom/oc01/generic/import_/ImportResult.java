// src/main/java/org/wisdom/oc01/generic/import_/ImportResult.java
package org.wisdom.oc01.generic.import_;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult<T> {

    private String entityName;
    private int totalRows;      // Tổng row có data (không tính header, không tính row trống)
    private int successCount;
    private int failedCount;

    @Builder.Default
    private List<T> importedItems = new ArrayList<>();

    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();
}