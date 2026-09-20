// ============================================
// QuestionRequest.java - Request DTO (Thêm lessonId)
// ============================================
package org.wisdom.oc01.dto.request.question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuestionRequest {

    @NotNull(message = "courseId không được để trống")
    private Integer courseId;

    // ✅ THÊM: lessonId (bài học mà câu hỏi thuộc về)
    private Integer lessonId;

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(max = 10000, message = "Nội dung câu hỏi không được vượt quá 10000 ký tự")
    private String content;

    @NotBlank(message = "Loại câu hỏi không được để trống")
    @Pattern(regexp = "^(SINGLE_CHOICE|MULTIPLE_CHOICE|TRUE_FALSE|SHORT_ANSWER)$",
            message = "Loại câu hỏi không hợp lệ")
    private String questionType;

    private String options;

    private String correctAnswer;

    @Size(max = 5000, message = "Giải thích không được vượt quá 5000 ký tự")
    private String explanation;

    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Trạng thái không hợp lệ")
    private String status;

    private Integer orderIndex;

    private BigDecimal points;
}