package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CourseStatusRequest {

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(DRAFT|PUBLISHED|ARCHIVED)$",
            message = "Trạng thái không hợp lệ. Chọn: DRAFT, PUBLISHED, ARCHIVED")
    private String status;
}