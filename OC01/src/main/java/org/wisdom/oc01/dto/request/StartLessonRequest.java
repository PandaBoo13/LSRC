package org.wisdom.oc01.dto.request;

import lombok.Data;

@Data
public class StartLessonRequest {
    private Integer lessonId;
    private Integer enrollmentId;
}