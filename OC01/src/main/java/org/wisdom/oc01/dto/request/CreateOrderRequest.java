package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotEmpty(message = "Vui lòng chọn ít nhất một khóa học")
    private List<Integer> courseIds;
}