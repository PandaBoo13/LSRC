// src/main/java/org/wisdom/oc01/generic/import_/ImportConfig.java
package org.wisdom.oc01.generic.import_;

import lombok.Builder;
import lombok.Data;

import java.util.function.Consumer;

@Data
@Builder
public class ImportConfig<T> {

    /** Tên hiển thị: "Câu hỏi", "Bài học", "Học viên"... */
    private String entityName;

    /** Parse 1 row → entity. */
    private RowParser<T> parser;

    /** Validate entity (optional — null = bỏ qua). */
    private RowValidator<T> validator;

    /** Batch save. Ví dụ: questionRepository::saveAll */
    private Consumer<java.util.List<T>> batchSaver;
}