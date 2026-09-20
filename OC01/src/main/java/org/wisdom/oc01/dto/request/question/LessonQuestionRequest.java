package org.wisdom.oc01.dto.request.question;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LessonQuestionRequest {

    @NotNull(message = "resourceId không được để trống")
    private Integer resourceId;

    @NotNull(message = "questionId không được để trống")
    private Integer questionId;

    private Integer orderIndex = 0;

    private BigDecimal points = BigDecimal.ONE;
}