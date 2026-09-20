// ============================================
// QuestionRequest.java - Tạo/Sửa Câu hỏi
// ============================================
package org.wisdom.oc01.dto.request.quiz;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class QuestionRequest {
    private Integer courseId;
    private String content;
    private String questionType;
    private List<OptionItem> options;
    private List<String> correctAnswer;
    private String explanation;
    private BigDecimal points;
    private Integer orderIndex;

    @Data
    public static class OptionItem {
        private String label;
        private String content;
    }
}