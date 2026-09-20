// UpdateTimeSpentRequest.java
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTimeSpentRequest {

    @NotNull(message = "Thời gian học không được để trống")
    @Min(value = 0, message = "Thời gian học không được âm")
    private Integer timeSpent;
}