package org.wisdom.oc01.dto.request;

import lombok.Data;

@Data
public class SubmitExamRequest {
    private Integer sessionId;
    private String answers; // JSON
    private Integer timeSpent;
}