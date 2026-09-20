// ============================================
// SubmitQuizRequest.java - Lưu tạm + Submit
// ============================================
package org.wisdom.oc01.dto.request.quiz;

import lombok.Data;
import java.util.List;

@Data
public class SubmitQuizRequest {
    private List<AnswerItem> answers;
    private Integer timeSpent;

    @Data
    public static class AnswerItem {
        private Integer questionId;
        private List<String> selectedOptions;
    }
}