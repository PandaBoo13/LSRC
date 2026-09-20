// src/main/java/org/wisdom/oc01/dto/response/question/QuestionImportResponse.java
package org.wisdom.oc01.dto.response.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.wisdom.oc01.generic.import_.ImportError;

import java.util.ArrayList;
import java.util.List;

/**
 * Response trả về sau khi import câu hỏi từ Excel.
 *
 * FE sử dụng để:
 *  - Hiển thị toast "Import thành công X / Y câu hỏi"
 *  - Nếu failedCount > 0: render bảng lỗi (rowNumber + message) để user sửa file
 *  - Nếu cần: reload danh sách câu hỏi vừa import
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionImportResponse {

    /** Tên entity hiển thị: "Câu hỏi" */
    private String entityName;

    /** Tổng số row có data (không tính header, không tính row trống) */
    private int totalRows;

    /** Số câu import thành công */
    private int successCount;

    /** Số câu bị lỗi */
    private int failedCount;

    /** Danh sách câu hỏi đã import thành công (map từ QuestionMapper) */
    @Builder.Default
    private List<QuestionResponse> importedQuestions = new ArrayList<>();

    /** Danh sách lỗi từng row (rowNumber 1-based, message mô tả lỗi) */
    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();
}