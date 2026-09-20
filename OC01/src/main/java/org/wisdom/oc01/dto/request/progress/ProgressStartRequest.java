package org.wisdom.oc01.dto.request.progress;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProgressStartRequest {

    @NotNull(message = "courseId không được để trống")
    private Integer courseId;

    private Integer resourceId; // Nếu là RESOURCE progress
    private String progressType; // COURSE hoặc RESOURCE
}