package org.wisdom.oc01.dto.response.question;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LessonQuestionResponse {

    private Integer id;
    private Integer resourceId;
    private String resourceTitle;
    private Integer questionId;
    private String questionContent;
    private String questionType;
    private Integer orderIndex;
    private BigDecimal points;
    private LocalDateTime createdAt;
}